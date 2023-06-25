//! A Rust implementation of the Hearthstone.js Deck Creator.

#![warn(missing_docs, rustdoc::missing_crate_level_docs)]

pub mod lib {
    //! The library of the Deck Creator

    use console::Term;
    use lazy_static::lazy_static;
    use regex::Regex;
    use serde_json::{self, Value};
    use std::{collections::HashMap, error::Error, fs, io::Write, process::exit, sync::Mutex};

    use walkdir::WalkDir;

    const CARDS_DIR: &str = "../cards";

    #[derive(Clone)]
    struct Command {
        callback: CommandCallback,
    }

    impl Command {
        fn create(name: String, callback: CommandCallback) -> Result<(), Box<dyn Error>> {
            let command = Command { callback };
            COMMANDS.lock()?.insert(name, command);

            Ok(())
        }
    }

    type CommandCallback =
        fn(&String, &mut Vec<Value>, &Vec<Value>, &mut Term) -> Result<(), Box<dyn Error>>;
    // ^^^^args,    deck,            cards,       terminal

    lazy_static! {
        static ref COMMANDS: Mutex<HashMap<String, Command>> = Mutex::new(HashMap::new());

        // `extract_json_from_card` regular expressions:
        static ref COMMENT_RE: Regex = Regex::new(r"(?sm)(//.*?$|/\*.*?\*/)").unwrap();
        static ref FIELD_RE: Regex = Regex::new(r"(?m)^(.*?)(\w*)(: .*?)$").unwrap();
        static ref LAST_FIELD_RE: Regex = Regex::new(r",\n}$").unwrap();
        static ref FUNCTIONS_END_RE: Regex = Regex::new(r"\r?\n\s*?\r?\n\s*?").unwrap();

        // `pick_class` regular expressions:
        static ref RUNE_RE: Regex = Regex::new(r"(?i)[BFU]").unwrap();
    }

    fn capitalize(s: &str) -> String {
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
        }
    }

    fn extract_json_from_card(text: &str) -> Result<String, Box<dyn Error>> {
        // Remove comments
        let cleaned_text = COMMENT_RE.replace_all(text, "");

        // Remove trailing and leading whitespace
        let mut cleaned_text = cleaned_text.trim().to_string();

        // Remove everything above `module.exports = `.
        cleaned_text = cleaned_text
            .split("module.exports = ")
            .nth(1)
            .ok_or("module.exports not found.")?
            .to_string();

        // Remove module.exports
        cleaned_text = cleaned_text.replace("module.exports = ", "");

        // Remove functions
        let mut result: String = FUNCTIONS_END_RE
            .split(&cleaned_text)
            .next()
            .ok_or("Failed to split on double newline.")?
            .trim()
            .to_string();

        // Remove the last comma
        if result.ends_with(',') {
            result.pop();
            result.push_str("\n}");
        } else {
            result = LAST_FIELD_RE.replace(&result, "\n}").to_string();
        }

        // Now double-quote the keys
        result = FIELD_RE.replace_all(&result, "$1\"$2\"$3").to_string();

        Ok(result)
    }

    fn find_card(cards: &[Value], name_or_id: &String) -> Option<Value> {
        let filtered = filter_cards(cards, &mut |card| {
            card["name"].as_str().unwrap_or("").to_lowercase() == *name_or_id.to_lowercase()
                || card["id"].to_string().eq(name_or_id)
        });

        if filtered.is_empty() {
            return None;
        }

        Some(filtered[0].to_owned())
    }

    /// Clears the screen and shows a watermark.
    pub fn print_watermark(term: &mut Term, clear_screen: bool) -> Result<(), Box<dyn Error>> {
        if clear_screen {
            term.clear_screen()?;
        }

        term.write_line("Hearthstone.js Deck Creator Rust (C) 2023\n")?;

        Ok(())
    }

    /// Finds and returns all cards from the cards folder
    pub fn find_cards() -> Result<Vec<Value>, Box<dyn Error>> {
        let mut found: Vec<Value> = vec![];

        for entry in WalkDir::new(CARDS_DIR).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                let filename = match entry.file_name().to_str() {
                    None => continue,
                    Some(t) => t,
                };

                // If the file is not a .js file, ignore it.
                if !filename.contains(".js") {
                    continue;
                }

                let path = entry.path();
                let mut text = fs::read_to_string(path)?;

                // Ignore test cards.
                let path_str = path.to_str().unwrap_or("");
                if path_str.contains("cards/Tests/") || path_str.contains("cards/Examples/") {
                    continue;
                }

                text = extract_json_from_card(&text)?;
                let parsed = serde_json::from_str(&text)?;

                found.push(parsed);
            }
        }

        Ok(found)
    }

    /// Filter away values from `cards`.
    ///
    /// # Example
    /// ```
    /// # use deck_creator_rs::lib;
    /// #
    /// let cards = lib::find_cards()?;
    ///
    /// let filtered_cards = lib::filter_cards(&cards, &mut |card| {
    ///     card.get("spellClass").is_some()
    /// });
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn filter_cards<T>(cards: &[Value], callback: &mut T) -> Vec<Value>
    where
        T: FnMut(&Value) -> bool,
    {
        cards
            .iter()
            .filter(|card| callback(card))
            .map(|f| f.to_owned())
            .collect()
    }

    /// Filter away uncollectible cards.
    pub fn filter_uncollectible(cards: &[Value]) -> Vec<Value> {
        filter_cards(cards, &mut |card| {
            !card["uncollectible"].as_bool().unwrap_or(false)
        })
    }

    /// Finds and returns the classes
    ///
    /// # Example
    /// ```
    /// # use deck_creator_rs::lib;
    /// let cards = lib::find_cards()?;
    /// let classes = lib::find_classes(&cards);
    ///
    /// assert_eq!(classes, vec!["Death Knight", "Demon Hunter", /* ... */]);
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn find_classes(cards: &[Value]) -> Vec<String> {
        let mut classes: Vec<String> = vec![];

        let cards = filter_cards(cards, &mut |card| {
            //println!("{:#?}", card["name"].as_str().map_or("", |name| name));
            card["name"]
                .as_str()
                .map_or(false, |name| name.contains(" Starting Hero"))
        });

        for card in cards.iter() {
            if let Some(name) = card.get("name") {
                if let Some(name) = name.as_str() {
                    classes.push(name.to_owned().replace(" Starting Hero", ""));
                }
            }
        }

        // Sort the classes alphabetically
        classes.sort_unstable();

        classes
    }

    /// Asks the user to pick a class.
    ///
    /// # Example
    /// ```
    /// # use deck_creator_rs::lib;
    /// # use console::Term;
    /// let mut term = Term::stdout();
    ///
    /// let cards = lib::find_cards()?;
    /// let classes = lib::find_classes(&cards);
    ///
    /// let (class, runes) = lib::pick_class(&mut term, &classes)?;
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn pick_class(
        term: &mut Term,
        classes: &[String],
        ignore_invalid_rune: bool,
    ) -> Result<(String, String), Box<dyn Error>> {
        let ask = format!(
            "What class do you want to choose?\n{}\n",
            &classes.join(", ")
        );
        term.write(&ask.as_bytes())?;
        let class = term.read_line()?;

        // Capitalize every word
        let class = class
            .split(' ')
            .map(capitalize)
            .collect::<Vec<String>>()
            .join(" ");

        // Check if the user input in lowercase matches any class
        classes
            .iter()
            .map(|class| class.to_lowercase())
            .collect::<Vec<String>>()
            .contains(&class.to_lowercase())
            .then_some(0)
            .ok_or("Invalid class")?;

        let mut runes = String::from("");

        // If the class is `Death Knight`
        let rune_classes = ["death knight"];
        if rune_classes.contains(&class.to_lowercase().as_str()) {
            // Runes

            while runes.chars().count() < 3 {
                print_watermark(term, true)?;

                let rune_question = format!(
                    "What runes do you want to add ({} more)\nBlood, Frost, Unholy\n",
                    3 - runes.chars().count()
                );
                term.write(&rune_question.as_bytes())?;
                let rune = term.read_line()?;
                let rune = rune.chars().next();

                if ignore_invalid_rune
                    && (rune.is_none() || !RUNE_RE.is_match(rune.unwrap().to_string().as_str()))
                {
                    continue;
                }

                let handled_rune = rune.ok_or("Invalid rune")?;

                runes.push(handled_rune);
            }

            runes = runes.to_uppercase();
        }

        Ok((class, runes))
    }

    /// Runs `pick_class` until it returns an `Ok` value.
    ///
    /// Might get stuck in an infinite loop so be careful.
    pub fn pick_class_no_err(term: &mut Term, classes: &[String]) -> (String, String) {
        loop {
            // Discard any errors.
            print_watermark(term, true).ok();

            if let Ok(tuple) = pick_class(term, classes, true) {
                return tuple;
            }
        }
    }

    /// Setup the cards to be used in some functions.
    pub fn setup_cards(
        cards: &[Value],
        class: &String,
        runes: &String,
    ) -> Result<Vec<Value>, Box<dyn Error>> {
        // Filter the cards
        // TODO: Remove cards that don't match the runes
        drop(runes.to_owned());

        let class_re = Regex::new(format!(r"Neutral|{}", class).as_str())?;

        let mut cards = filter_uncollectible(cards);
        cards = filter_cards(&cards, &mut |card| {
            class_re.is_match(card["class"].as_str().unwrap_or(""))
        });

        Ok(cards)
    }

    /// Sets up the commands.
    ///
    /// TODO: Add better docs
    pub fn setup_cmds() -> Result<(), Box<dyn Error>> {
        // Add
        Command::create("add".into(), |args, deck, cards, _| {
            deck.push(find_card(cards, args).ok_or("Invalid Card.")?);
            Ok(())
        })?;

        // Remove
        Command::create("rem".into(), |args, deck, cards, _| {
            let card = find_card(cards, args).ok_or("Invalid Card.")?;

            // TODO: Maybe add an option to choose `swap_remove` or `remove`.
            deck.swap_remove(
                deck.iter()
                    .position(|x| *x == card)
                    .ok_or("Card not found in the deck.")?,
            );
            Ok(())
        })?;

        // Deck
        Command::create("deck".into(), |_, deck, _, term| show_deck(deck, term))?;

        // Exit
        Command::create("exit".into(), |_, _, _, _| {
            exit(0);
        })?;

        Ok(())
    }

    /// Show the cards
    ///
    /// Remember to supply the return value of `setup_cards` for the `cards` value.
    pub fn show_cards(cards: &[Value], page: &usize) -> Result<(), Box<dyn Error>> {
        // Cards per page
        // TODO: Add cpp as a setting
        // TODO: Add colors
        // TODO: Implement wall logic
        let cpp = 15;

        let in_bound = cpp * (page - 1);
        let out_bound = cpp * page;

        for card in cards[in_bound..out_bound].iter() {
            println!(
                "{} - {}",
                card["name"].to_string().replace('"', ""),
                card["id"]
            );
        }

        Ok(())
    }

    /// Show the deck
    pub fn show_deck(deck: &mut [Value], term: &mut Term) -> Result<(), Box<dyn Error>> {
        for card in deck.iter() {
            println!(
                "{} - {}",
                card["name"].to_string().replace('"', ""),
                card["id"]
            );
        }

        term.write(b"\nPress enter to continue...")?;
        term.read_line()?;

        Ok(())
    }

    /// Handles a command
    pub fn handle_command(
        command: String,
        deck: &mut Vec<Value>,
        cards: &Vec<Value>,
        term: &mut Term,
    ) -> Result<(), Box<dyn Error>> {
        // If the user wrote the name / id of a card
        if find_card(cards, &command).is_some() {
            // TODO: Add a setting to change the add command
            return handle_command(String::from("add ") + &command, deck, cards, term);
        }

        let args = command.split(' ').skip(1).collect::<Vec<&str>>().join(" ");
        let command_name = command.split(' ').next().ok_or("Could not find command.")?;

        let commands_binding = COMMANDS.lock()?;

        let cmd = commands_binding
            .get(&command_name.to_string())
            .ok_or("Could not find command.")?;

        // Run the command
        (cmd.callback)(&args, deck, cards, term)
    }

    /// Does a loop
    pub fn do_loop(
        term: &mut Term,
        deck: &mut Vec<Value>,
        cards: &Vec<Value>,
    ) -> Result<(), Box<dyn Error>> {
        dbg!(&deck); // TODO: Remove this line

        term.write(b"\n> ")?;
        let user = term.read_line()?;

        handle_command(user, deck, cards, term)
    }
}

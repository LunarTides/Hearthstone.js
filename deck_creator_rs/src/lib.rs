//! A Rust implementation of the Hearthstone.js Card Creator.

#![warn(missing_docs, rustdoc::missing_crate_level_docs)]

pub mod lib {
    //! The library of the Card Creator

    use console::Term;
    use json::JsonValue;
    use regex::Regex;
    use std::{error::Error, fs, io::Write};

    use walkdir::WalkDir;

    const CARDS_DIR: &str = "../cards";

    /// Writes `prompt` to `term`, and returns some user input.
    ///
    /// The prompt is written as-is. No added newlines.
    ///
    /// # Examples
    /// ```
    /// # use deck_creator_rs::lib;
    /// # use console::Term;
    /// let mut term = Term::stdout();
    ///
    /// let user = lib::input(&mut term, "Example? ")?;
    ///
    /// // Writes the user input to term
    /// term.write_line(&user)?;
    /// // Example? Foo
    /// // Foo
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn input(term: &mut Term, prompt: &str) -> Result<String, Box<dyn Error>> {
        if let Err(e) = term.write(prompt.as_bytes()) {
            return Err(Box::new(e));
        }

        // Read line
        let user = match term.read_line() {
            Err(e) => return Err(Box::new(e)),
            Ok(u) => u,
        };

        Ok(user)
    }

    /// Got help from by ChatGPT: https://chat.openai.com/share/43669cb2-3318-4ff3-9e8c-1ba39d2804bc
    fn extract_json_from_card(text: &str) -> Result<String, Box<dyn Error>> {
        todo!("Fix this!");

        let re = Regex::new(r"(?ms)(?://.*)|^\s*\{\s*((?:[^{}]*,?\s*)*)\n\n")?;
        let cleaned_text = re.replace_all(text, "");
        let capture = re
            .captures(&cleaned_text)
            .ok_or("No JSON object found in the input.")?;
        Ok(capture.get(1).map_or("", |m| m.as_str()).to_string())
    }

    /// Finds and returns all cards from the cards folder
    pub fn find_cards() -> Result<Vec<JsonValue>, Box<dyn Error>> {
        let mut found: Vec<json::JsonValue> = vec![];

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
                let text = fs::read_to_string(path)?;

                // Todo: Fix this
                //let text = extract_json_from_card(&text)?;
                //dbg!(&text);
                //let parsed = json::parse(&text)?;

                let parsed = json::parse(&json::stringify(text))?;
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
    ///     card.as_str().unwrap_or("").contains("spellClass")
    /// });
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn filter_cards<T>(cards: &[JsonValue], callback: &mut T) -> Vec<JsonValue>
    where
        T: FnMut(&&JsonValue) -> bool,
    {
        cards
            .iter()
            .filter(|card| callback(card))
            .map(|f| f.to_owned())
            .collect()
    }

    /// Check if a card's `key` is in the `values` array.
    ///
    /// # Examples
    /// TODO: Add examples
    pub fn card_key_in<T>(card: JsonValue, key: &str, values: &[T]) -> bool {
        todo!()
    }
}

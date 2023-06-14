//! A Rust implementation of the Hearthstone.js Card Creator.

#![warn(missing_docs, rustdoc::missing_crate_level_docs)]

pub mod lib {
    //! The library of the Card Creator

    use console::Term;
    use serde_json;
    use lazy_static::lazy_static;
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

    fn extract_json_from_card(text: &str) -> Result<String, Box<dyn Error>> {
        lazy_static! {
            // Todo: Make this use correct error handling if possible
            static ref COMMENT_RE: Regex = Regex::new(r"(?sm)(//.*?$|/\*.*?\*/)").unwrap();
            static ref FIELD_RE: Regex = Regex::new(r"(?m)^(.*?)(\w*)(: .*?)$").unwrap();
            static ref LAST_FIELD_RE: Regex = Regex::new(r",\n}$").unwrap();
            static ref FUNCTIONS_END_RE: Regex = Regex::new(r"\r?\n\s*?\r?\n\s*?").unwrap();
        };

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

    /// Finds and returns all cards from the cards folder
    pub fn find_cards() -> Result<Vec<serde_json::Value>, Box<dyn Error>> {
        let mut found: Vec<serde_json::Value> = vec![];

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

                // We don't care about uncollectible cards.
                if text.contains("uncollectible: true") {
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
    ///     card.as_str().unwrap_or("").contains("spellClass")
    /// });
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn filter_cards<T>(cards: &[serde_json::Value], callback: &mut T) -> Vec<serde_json::Value>
    where
        T: FnMut(&serde_json::Value) -> bool,
    {
        cards
            .iter()
            .filter(|card| callback(card))
            .map(|f| f.to_owned())
            .collect()
    }
}

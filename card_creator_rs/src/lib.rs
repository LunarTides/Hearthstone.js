//! A Rust implementation of the Hearthstone.js Card Creator.

#![warn(missing_docs, rustdoc::missing_crate_level_docs)]

pub mod lib {
    //! The library of the Card Creator

    use console::Term;
    use std::{error::Error, fs, io::Write};

    use walkdir::WalkDir;

    const CARDS_DIR: &str = "../cards";

    /// Writes `prompt` to `term`, and returns some user input.
    ///
    /// The prompt is written as-is. No added newlines.
    ///
    /// # Examples
    /// ```
    /// # use card_creator_rs::lib;
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

    /// Finds and returns all cards from the cards folder
    pub fn find_cards() -> Result<Vec<json::JsonValue>, Box<dyn Error>> {
        let mut found: Vec<json::JsonValue> = vec![];

        for entry in WalkDir::new(CARDS_DIR).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                let path = entry.path();
                let text = fs::read_to_string(path)?;

                let parsed = json::parse(&json::stringify(text))?;
                found.push(parsed);
            }
        }

        Ok(found)
    }
}

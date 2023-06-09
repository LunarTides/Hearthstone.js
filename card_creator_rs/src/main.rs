// I only learned rust recently and it has a steep learning curve.
// Bear with me

use card_creator_rs::lib;
use console::Term;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let mut term = Term::stdout();

    let user = lib::input(&mut term, "Example? ")?;
    term.write_line(&user)?;

    // TODO: Add better error handling here.
    lib::find_cards().unwrap();

    Ok(())
}

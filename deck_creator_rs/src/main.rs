// I only learned rust recently and it has a steep learning curve.
// Bear with me

use console::Term;
use deck_creator_rs::lib;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let mut term = Term::stdout();

    let cards = lib::find_cards()?;
    let classes = lib::find_classes(&cards);

    // TODO: Add error handling.
    let (class, runes) = lib::pick_class(&mut term, &classes)?;

    println!("{}", class);
    println!("{}", runes);

    let user = lib::input(&mut term, "Example? ")?;
    term.write_line(&user)?;

    Ok(())
}

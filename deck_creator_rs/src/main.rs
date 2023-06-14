// I only learned rust recently and it has a steep learning curve.
// Bear with me

use console::Term;
use deck_creator_rs::lib;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let cards = lib::find_cards()?;
    let filtered_cards = lib::filter_cards(&cards, &mut |card| {
        card.as_str().unwrap_or("").contains("spellClass")
    });

    dbg!(&filtered_cards[0]);

    let mut term = Term::stdout();

    let user = lib::input(&mut term, "Example? ")?;
    term.write_line(&user)?;

    Ok(())
}

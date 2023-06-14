// I only learned rust recently and it has a steep learning curve.
// Bear with me

use console::Term;
use deck_creator_rs::lib;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let cards = lib::find_cards()?;
    let filtered_cards = lib::filter_cards(&cards, &mut |card| {
        card.get("spellClass").is_some()
    });

    println!("{:#?}", &filtered_cards);

    let mut term = Term::stdout();

    let user = lib::input(&mut term, "Example? ")?;
    term.write_line(&user)?;

    Ok(())
}

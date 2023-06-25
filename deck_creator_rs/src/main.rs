// I only learned rust recently and it has a steep learning curve.
// Bear with me

use console::Term;
use deck_creator_rs::lib;
use serde_json::Value;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let mut term = Term::stdout();
    lib::print_watermark(&mut term, true)?;

    let cards = lib::find_cards()?;
    let classes = lib::find_classes(&cards);

    let mut deck: Vec<Value> = vec![];

    let (class, runes) = lib::pick_class_no_err(&mut term, &classes);

    let filtered_cards = lib::setup_cards(&cards, &class, &runes)?;
    lib::setup_cmds()?;

    loop {
        lib::print_watermark(&mut term, true)?;
        lib::show_cards(&filtered_cards, &1)?;

        match lib::do_loop(&mut term, &mut deck, &filtered_cards) {
            Err(err) => {
                term.write_line(&err.to_string())?;
                term.read_line()?;
            }
            Ok(t) => t,
        }
    }
}

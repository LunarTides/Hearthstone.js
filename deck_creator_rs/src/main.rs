// I only learned rust recently and it has a steep learning curve.
// Bear with me

use console::Term;
use deck_creator_rs::lib;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let mut term = Term::stdout();
    lib::print_watermark(&mut term, true)?;

    let cards = lib::find_cards()?;
    let classes = lib::find_classes(&cards);

    let (class, runes) = lib::pick_class_no_err(&mut term, &classes);

    println!("{}", class);
    println!("{}", runes);

    let filtered_cards = lib::setup_cards(&cards, &class)?;

    lib::show_cards(&filtered_cards, &1)?;

    loop {
        match lib::do_loop(&mut term) {
            Err(err) => {
                lib::input(&mut term, err.to_string().as_str()).ok();
            },
            Ok(t) => t,
        }
    }
}

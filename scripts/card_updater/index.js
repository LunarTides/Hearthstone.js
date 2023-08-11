//@ts-check
let vanillaCards = require("../../card_creator/vanilla/.ignore.cards.json");
const { Game } = require("../../src/game");

const game = new Game({}, {});
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

let customCards = game.functions.getCards(false);
vanillaCards = game.functions.filterVanillaCards(vanillaCards, false, true);

console.log("WARNING: Make sure to run `genvanilla.bat` (requires an internet connection). Also this program might find the incorrect card, so if it says that a card has 10 health instead of 2 sometimes, just ignore it.\n");

customCards.forEach(c => {
    let vanilla = vanillaCards.find(a => a.name.toLowerCase() == (c.displayName || c.name).toLowerCase() && a.type.toLowerCase() == c.type.toLowerCase());
    if (!vanilla) return; // There is no vanilla version of that card.

    Object.entries(c).forEach(ent => {
        let [key, val] = ent;

        if (key == "stats") {
            check("attack", val[0].toString(), vanilla, c);
            check("health", val[1].toString(), vanilla, c);
            return;
        }

        vanilla.text = vanilla.text.replaceAll("<b>", "&B");
        vanilla.text = vanilla.text.replaceAll("</b>", "&R");
        vanilla.text = vanilla.text.replace(/\$(\d*?) /g, "$1 ");
        vanilla.text = vanilla.text.replaceAll("\n", " ");
        vanilla.text = vanilla.text.replaceAll("[x]", "");

        check(key, val, vanilla, c);
    });
});

function check(key, val, vanilla, card) {
    let ignore = ["id", "set", "name", "rarity", "type"];

    let table = {
        "desc": "text"
    }

    if (!vanilla[table[key]] || ignore.includes(key)) return;
    if (val.toLowerCase() == vanilla[table[key]].toString().toLowerCase()) return;

    console.log("Card outdated!");
    console.log(`Name: ${card.name}`);
    console.log(`Local: "${key}: ${val}"`);
    console.log(`New:   "${key}: ${vanilla[table[key]]}"\n`);
}

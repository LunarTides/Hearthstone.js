const vanillaCards = require("../card_creator/vanilla/.ignore.cards.json");
const { Game } = require("../src/game");

const game = new Game({}, {});
game.dirname = __dirname + "/../";

game.functions.importCards("../cards");
game.functions.importConfig("../config");

let customCards = game.functions.getCards(false);

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

        check(key, val, vanilla, c);
    });
});

function check(key, val, vanilla, card) {
    let ignore = ["id", "set", "name", "rarity", "type"];

    if (!vanilla[key] || ignore.includes(key)) return;
    if (val.toLowerCase() == vanilla[key].toString().toLowerCase()) return;

    console.log("Card outdated!");
    console.log(`Name: ${card.name}`);
    console.log(`Local: "${key}: ${val}"`);
    console.log(`New:   "${key}: ${vanilla[key]}"\n`);
}

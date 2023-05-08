const vanillaCards = require("../card_creator/vanilla/.ignore.cards.json");
const { Game } = require("../src/game");

const game = new Game({}, {});
game.dirname = __dirname + "/../";

game.functions.importCards("../cards");
game.functions.importConfig("../config");

let customCards = game.functions.getCards(false);

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

    console.log("Outdate detected!");
    console.log(`Name: ${card.name}`);
    console.log(`Local: "${key}: ${val}"`);
    console.log(`New:   "${key}: ${vanilla[key]}"\n`);
}

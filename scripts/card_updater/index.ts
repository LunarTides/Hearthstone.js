const vanillaCards = require("../../card_creator/vanilla/.ignore.cards.json");
import { Game, Player } from "../../src/internal.js";
import { Blueprint, VanillaCard } from "../../src/types.js";

const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
const game = new Game(player1, player2);
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

let customCards = game.functions.getCards(false);
let filteredVanillaCards = game.functions.filterVanillaCards(vanillaCards, false, true);

console.log("WARNING: Make sure to run `genvanilla.bat` (requires an internet connection). Also this program might find the incorrect card, so if it says that a card has 10 health instead of 2 sometimes, just ignore it.\n");

customCards.forEach(c => {
    let vanilla = filteredVanillaCards.find(a => a.name.toLowerCase() == (c.displayName || c.name).toLowerCase() && a.type.toLowerCase() == c.type.toLowerCase());
    if (!vanilla) return; // There is no vanilla version of that card.

    Object.entries(c).forEach(ent => {
        let [key, val] = ent;

        // For some reason, typescript thinks that vanilla can be undefined
        vanilla = vanilla!;

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

function check(key: string, val: string, vanilla: VanillaCard, card: Blueprint) {
    let ignore = ["id", "set", "name", "rarity", "type"];

    let table = {
        "desc": "text"
    }

    // @ts-expect-error
    if (!vanilla[table[key]] || ignore.includes(key)) return;
    // @ts-expect-error
    if (val.toLowerCase() == vanilla[table[key]].toString().toLowerCase()) return;

    console.log("Card outdated!");
    console.log(`Name: ${card.name}`);
    console.log(`Local: "${key}: ${val}"`);
    // @ts-expect-error
    console.log(`New:   "${key}: ${vanilla[table[key]]}"\n`);
}

/**
 * The card updater script.
 * @module Card Updater
 */

import { createGame } from "../src/internal.js";
import { Blueprint, VanillaCard } from "../src/types.js";

const { game, player1, player2 } = createGame();

function main() {
    const [vanillaCards, error] = game.functions.getVanillaCards();

    if (error) {
        game.input(error);
        process.exit(1);
    }

    let filteredVanillaCards = game.functions.filterVanillaCards(vanillaCards, false, false);
    let customCards = game.functions.getCards(false);

    customCards.forEach(custom => {
        // Find the equivalent vanilla card 
        let vanilla = filteredVanillaCards.find(vanilla => {
            return (
                vanilla.name.toLowerCase() == game.interact.getDisplayName(custom).toLowerCase() &&
                vanilla.type.toLowerCase() == custom.type.toLowerCase()
            );
        });

        if (!vanilla) return; // There is no vanilla version of that card.

        Object.entries(custom).forEach(ent => {
            let [key, val] = ent;

            // HACK: For some reason, typescript thinks that vanilla can be undefined
            vanilla = vanilla!;

            if (key == "stats") {
                check("attack", val[0].toString(), vanilla, custom);
                check("health", val[1].toString(), vanilla, custom);
                return;
            }

            vanilla.text = vanilla.text?.replaceAll("<b>", "<bold>");
            vanilla.text = vanilla.text?.replaceAll("</b>", "</bold>");
            vanilla.text = vanilla.text?.replaceAll("\n", " ");
            vanilla.text = vanilla.text?.replaceAll("[x]", "");

            check(key, val, vanilla, custom);
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
        if (val.toLowerCase() == vanilla[table[key]]?.toString().toLowerCase()) return;

        console.log("Card outdated!");
        console.log(`Name: ${card.name}`);
        console.log(`Local: "${key}: ${val}"`);
        // @ts-expect-error
        console.log(`New:   "${key}: ${vanilla[table[key]]}"\n`);
    }
}

main();

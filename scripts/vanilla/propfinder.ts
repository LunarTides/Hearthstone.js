/**
 * @module Vanilla Card Property Finder
 */

import { createGame } from "../../src/internal.js";

const { game, player1, player2 } = createGame();

const props: {[key: string]: [string, number]} = {};
const types: {[key: string]: number} = {};

function main() {
    const [vanillaCards, error] = game.functions.card.vanilla.getAll();

    if (error) {
        game.pause(error);
        process.exit(1);
    }

    vanillaCards.forEach(vanillaCard => {
        Object.entries(vanillaCard).forEach(ent => {
            const [key, val] = ent;

            if (Object.keys(props).includes(key)) {
                const storedType = props[key][0];
                if (storedType !== typeof val) game.logWarn("<yellow>Discrepancy found. Stored type: %s, Found type %s.</yellow>", storedType, typeof val);

                props[key][1]++;
                return;
            }

            props[key] = [typeof val, 1];
        });

        if (Object.keys(types).includes(vanillaCard.type)) {
            types[vanillaCard.type]++;
            return;
        }
        types[vanillaCard.type] = 1;
    });

    game.log("<b>TYPES:</b>");
    game.log(types);
    game.log("<b>PROPS:</b>");
    game.log(props);
}

main();

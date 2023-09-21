/**
 * @module Vanilla Card Property Finder
 */

import { createGame } from "../../src/internal.js";

const { game, player1, player2 } = createGame();

const props: {[key: string]: [string, number]} = {};

function main() {
    const [vanillaCards, error] = game.functions.getVanillaCards();

    if (error) {
        game.input(error);
        process.exit(1);
    }

    vanillaCards.forEach(vanillaCard => {
        Object.entries(vanillaCard).forEach(ent => {
            let [key, val] = ent;

            if (Object.keys(props).includes(key)) {
                props[key][1]++;
                return;
            }

            props[key] = [typeof val, 0];
        });
    });

    game.log(props);
}

main();

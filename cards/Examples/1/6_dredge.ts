// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Dredge Example",
    stats: [1, 1],
    text: "This example card shows you how to use keywords like dredge. <b>Battlecry: Dredge.</b>",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 34,

    battlecry(plr, game, self) {
        // Dredge.
        
        // `game.interact` is an instance of the Interact object as defined in `src/interact.ts`.
        game.interact.dredge();
    },

    // Ignore this
    test(plr, game, self) {
        const assert = game.functions.assert;

        // Makes the player answer "1" to the next question
        plr.inputQueue = ["1"];
        let card = game.interact.dredge();

        // Check if the top card of the player's deck is the card that was dredged
        assert(() => game.lodash.last(plr.deck) === card);
    }
}

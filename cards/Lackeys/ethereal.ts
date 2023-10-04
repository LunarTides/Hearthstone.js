// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Ethereal Lackey",
    stats: [1, 1],
    text: "<b>Battlecry: Discover</b> a spell.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 24,

    battlecry(plr, self) {
        // Discover a spell.

        // Filter out all cards that aren't spells
        const list = game.functions.card.getAll().filter(c => c.type === "Spell");
        if (list.length <= 0) return;

        // Prompt a discover
        const card = game.interact.card.discover("Discover a spell.", list);
        if (!card) return game.constants.REFUND;

        // Add the card to the player's hand
        plr.addToHand(card);
        return true;
    },

    test(plr, self) {
        const assert = game.functions.error.assert;

        // If there are no spells, pass the test
        if (game.functions.card.getAll().filter(c => c.type === "Spell" && game.functions.card.validateClasses(self.classes, plr.heroClass)).length <= 0) return;

        // The player ALWAYS answer 1.
        plr.inputQueue = "1";

        // Do this 50 times
        for (let i = 0; i < 50; i++) {
            // Activate the battlecry and get the card from the player's hand.
            plr.hand = [];
            self.activateBattlecry();
            const card = plr.hand[0];

            assert(() => card.type === "Spell");
        }
    }
}

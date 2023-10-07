// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Corrupt Example",
    stats: [1, 1],
    text: "<b>Corrupt.</b>",
    cost: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 40,

    create(plr, self) {
        // Put the name (not the display name) of the corrupted counterpart here.
        // Corrupted is another system that is very untested and might get a rewrite.
        self.addKeyword("Corrupt", "Corrupted Example");
    },

    test(plr, self) {
        // TODO: Test
    }
}

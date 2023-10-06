// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Example Example",
    stats: [1, 1],
    text: "<b>Hi:</b> Gain +1/+1.",
    cost: 1,

    // Note that this says "Example"
    type: "Example",

    // This is the id of the example card for this card.
    // In this case, THIS card is the example card, so we put the id of this card,
    // which is 75
    example: 75,

    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 75,

    // This ability triggers when the card is played.
    // This works indentically to battlecry
    hi(plr, self) {
        // Gain +1/+1.
        
        self.addStats(1, 1);
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        assert(() => self.getAttack() === 1 && self.getHealth() === 1);
        self.activate("hi");
        assert(() => self.getAttack() === 2 && self.getHealth() === 2);
    }
}

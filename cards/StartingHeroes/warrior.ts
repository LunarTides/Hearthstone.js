// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    text: "Warrior starting hero",
    cost: 0,
    type: "Hero",
    hpText: "Gain 2 Armor.",
    hpCost: 2,
    classes: ["Warrior"],
    rarity: "Free",
    uncollectible: true,
    id: 7,

    heropower(plr, self) {
        // Gain 2 Armor.

        // Give the player +2 armor.
        plr.addArmor(2);
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        // The player should have 0 armor
        assert(() => plr.armor === 0);
        self.activate("heropower");

        // The player should now have 2 armor
        assert(() => plr.armor === 2);
    }
}

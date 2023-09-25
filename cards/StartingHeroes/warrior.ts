// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    desc: "Warrior starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Warrior"],
    rarity: "Free",
    hpDesc: "Gain 2 Armor.",
    hpCost: 2,
    uncollectible: true,
    id: 7,

    heropower(plr, game, self) {
        // Gain 2 Armor.

        // Give the player +2 armor.
        // CARDTODO: Maybe there should be an `addArmor` function?
        plr.armor += 2;
    },

    test(plr, game, self) {
        const assert = game.functions.assert;

        // The player should have 0 armor
        assert(() => plr.armor === 0);
        self.activate("heropower");

        // The player should now have 2 armor
        assert(() => plr.armor === 2);
    }
}

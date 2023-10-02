// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Druid Starting Hero",
    displayName: "Malfurion Stormrage",
    text: "Druid starting hero",
    cost: 0,
    type: "Hero",
    hpText: "+1 Attack this turn. +1 Armor",
    hpCost: 2,
    classes: ["Druid"],
    rarity: "Free",
    uncollectible: true,
    id: 5,

    heropower(plr, self) {
        // +1 Attack this turn. +1 Armor.

        // Give the player +1 attack.
        plr.addAttack(1);

        // Give the player +1 armor.
        // CARDTODO: Maybe there should be an `addArmor` function?
        plr.armor += 1;
    },

    test(plr, self) {
        const assert = game.functions.assert;
        // The player should start with 0 attack

        assert(() => plr.attack === 0);
        assert(() => plr.armor === 0);
        self.activate("heropower");

        // The player should gain 1 attack
        assert(() => plr.attack === 1);
        assert(() => plr.armor === 1);
    }
}

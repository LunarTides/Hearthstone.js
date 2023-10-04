// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Demon Hunter Starting Hero",
    displayName: "Illidan Stormrage",
    text: "Demon hunter starting hero",
    cost: 0,
    type: "Hero",
    hpText: "+1 Attack this turn.",
    hpCost: 1,
    classes: ["Demon Hunter"],
    rarity: "Free",
    uncollectible: true,
    id: 13,

    heropower(plr, self) {
        // +1 Attack this turn.

        // Give the player +1 attack.
        plr.addAttack(1);
    },
    
    test(plr, self) {
        const assert = game.functions.error.assert;

        // The player should start with 0 attack
        assert(() => plr.attack === 0);
        self.activate("heropower");

        // The player should gain 1 attack
        assert(() => plr.attack === 1);
    }
}

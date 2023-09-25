// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Hunter Starting Hero",
    displayName: "Rexxar",
    text: "Hunter starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Hunter"],
    rarity: "Free",
    hpText: "Deal 2 damage to the enemy hero.",
    hpCost: 2,
    uncollectible: true,
    id: 6,

    heropower(plr, game, self) {
        // Deal 2 damage to the enemy hero.
        game.attack(2, plr.getOpponent());
    },

    test(plr, game, self) {
        const assert = game.functions.assert;

        // The opponent should have 30 health
        assert(() => plr.getOpponent().getHealth() === 30);
        self.activate("heropower");

        // The opponent should now have 28 health.
        assert(() => plr.getOpponent().getHealth() === 30 - 2);
    }
}

// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Mage Starting Hero",
    displayName: "Jaina Proudmoore",
    text: "Mage starting hero",
    cost: 0,
    type: "Hero",
    hpText: "Deal 1 damage.",
    hpCost: 2,
    classes: ["Mage"],
    rarity: "Free",
    uncollectible: true,
    id: 4,

    heropower(plr, self) {
        // Deal 1 damage.

        // Suppress the "CastSpellOnMinion" event, since this isn't a spell
        const unsuppress = game.functions.event.suppress("CastSpellOnMinion");
        // Use of `selectTarget` in the `heropower` ability requires the use of the `forceElusive` flag
        // This flag might cause the `CastSpellOnMinion` event to be broadcast, so suppress it since this isn't a spell
        const target = game.interact.selectTarget("Deal 1 damage.", self, "any", "any", ["forceElusive"]);
        unsuppress();

        // If no target was selected, refund the hero power
        if (!target) return game.constants.REFUND;

        // Deal 1 damage to the target
        game.attack(1, target);
        return true;
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        // The opponent should have 30 health.
        assert(() => plr.getOpponent().getHealth() === 30);

        plr.inputQueue = ["face", "y"];
        self.activate("heropower");

        // The opponent should have 29 health.
        assert(() => plr.getOpponent().getHealth() === 30 - 1);
    }
}

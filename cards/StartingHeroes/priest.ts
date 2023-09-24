// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Priest Starting Hero",
    displayName: "Anduin Wrynn",
    desc: "Priest starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Priest"],
    rarity: "Free",
    hpDesc: "Restore 2 Health.",
    hpCost: 2,
    uncollectible: true,
    id: 8,

    heropower(plr, game, self) {
        // Restore 2 Health.

        // We don't want the "CastSpellOnMinion" event to be broadcast here, so suppress it
        let unsuppress = game.functions.suppressEvent("CastSpellOnMinion");

        // Hero power targets need to use the `force_elusive` flag.
        let target = game.interact.selectTarget("Restore 2 health.", self, "any", "any", ["force_elusive"]);

        // Re-enable the "CastSpellOnMinion" event
        unsuppress();

        // If no target was selected, refund the hero power
        if (!target) return game.constants.REFUND;

        // Restore 2 health to the target
        target.addHealth(2, true);
        return true;
    },

    test(plr, game, self) {
        // TODO: Add proper tests
        return true;
    }
}

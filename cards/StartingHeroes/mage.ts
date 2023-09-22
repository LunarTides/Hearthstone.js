// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Mage Starting Hero",
    displayName: "Jaina Proudmoore",
    desc: "Mage starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Mage"],
    rarity: "Free",
    hpDesc: "Deal 1 damage.",
    hpCost: 2,
    uncollectible: true,
    id: 4,

    heropower(plr, game, self) {
        // Deal 1 damage.

        // Suppress the "CastSpellOnMinion" event, since this isn't a spell
        let unsuppress = game.functions.suppressEvent("CastSpellOnMinion");
        // Use of `selectTarget` in the `heropower` ability requires the use of the `force_elusive` flag
        // This flag might cause the `CastSpellOnMinion` event to be broadcast, so suppress it since this isn't a spell
        const target = game.interact.selectTarget("Deal 1 damage.", self, "any", "any", ["force_elusive"]);
        unsuppress();

        // If no target was selected, refund the hero power
        if (!target) return game.constants.REFUND;

        // Deal 1 damage to the target
        game.attack(1, target);
        return true;
    }
}
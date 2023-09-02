// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Kobold Lackey",
    stats: [1, 1],
    desc: "Battlecry: Deal $2 damage.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 27,

    battlecry(plr, game, self) {
        // Deal $2 damage.

        // Select a target
        let target = game.interact.selectTarget("Deal $2 damage.", self, "any", "any");

        // If no target was selected, refund
        if (!target) return game.constants.REFUND;

        // Deal 2 damage to the target (spell damage included)
        game.attack("$2", target);
        return true;
    }
}

export default blueprint;

// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Goblin Lackey",
    stats: [1, 1],
    desc: "&BBattlecry:&R Give a friendly minion +1 Attack and &BRush&R.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 26,

    battlecry(plr, game, self) {
        // Give a friendly minion +1 Attack and Rush.

        // Prompt the user to select a friendly minion
        let target = game.interact.selectCardTarget("Give a friendly minion +1 Attack and Rush", self, "friendly");

        // If no target was selected, refund
        if (!target) return game.constants.REFUND;

        // Add +1 Attack
        target.addStats(1, 0);

        // Add Rush
        target.addKeyword("Rush");
        return true;
    }
}

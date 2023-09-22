// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Combined Example 2 Corrupted",
    stats: [9, 9],
    desc: "Colossal +2. Dormant. Corrupted. <b>Battlecry: Dredge.</b>",
    cost: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Legendary",
    colossal: ["Combined Example 2 Left Arm", "", "Combined Example 2 Right Arm"],
    dormant: 2,
    uncollectible: true,
    id: 49,

    battlecry(plr, game, self) {
        // Dredge.

        game.interact.dredge();
    }
}

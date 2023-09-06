// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Combined Example 2 Corrupted",
    stats: [9, 9],
    desc: "Colossal +2. Dormant. Corrupted. Battlecry: Dredge.",
    mana: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Legendary",
    colossal: ["Combined Example 2 Left Arm", "", "Combined Example 2 Right Arm"],
    keywords: ["Dormant"],
    uncollectible: true,
    id: 50,

    battlecry(plr, game, self) {
        game.interact.dredge();
    }
}

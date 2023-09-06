// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    // Look in `corrupt.mts` first.
    // This is just an ordinary card.
    name: "Corrupted Example",
    stats: [2, 2],
    desc: "Corrupted.",
    mana: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 42,
}

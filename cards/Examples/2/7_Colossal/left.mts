// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    // Look in `main.mts` first.
    // This will be summoned above the main minion
    name: "Colossal Example Left Arm",

    // The game will use this instead of the name when displaying the card. This doesn't need to be unique.
    // We use this here since `Left Arm` might be a common name, and the `name` field needs to be unique.
    displayName: "Left Arm", 

    stats: [2, 1],
    desc: "",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 44,
}

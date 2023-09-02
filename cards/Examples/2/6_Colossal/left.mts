// Created by Hand

import { Blueprint } from "../../../../src/types.js";

const blueprint: Blueprint = {
    // Look in `main.ts` first.
    // This will be summoned above the main minion
    name: "Colossal Example Left Arm",
    displayName: "Left Arm", // The game will use this instead of the name when displaying the card. This doesn't need to be unique.
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

export default blueprint;

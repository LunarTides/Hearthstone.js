// Created by Hand

import { Blueprint } from "../../../../src/types.js";

const blueprint: Blueprint = {
    // Look in `main.ts` first.
    // This will be summoned below the main minion
    name: "Colossal Example Right Arm",
    displayName: "Right Arm", // Look in `left.ts` for an explanation
    stats: [1, 2],
    desc: "",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 45,
}

export default blueprint;

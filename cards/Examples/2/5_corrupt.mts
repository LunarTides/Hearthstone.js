// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Corrupt Example",
    stats: [1, 1],
    desc: "&BCorrupt.&R",
    mana: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    corrupt: "Corrupted Example", // Put the name of the corrupted counterpart
    uncollectible: true,
    id: 41,
}

export default blueprint;

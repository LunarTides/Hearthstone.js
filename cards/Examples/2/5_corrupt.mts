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

    // Put the name (not the display name) of the corrupted counterpart here.
    // Corrupted is another system that is very untested and might get a rewrite.
    corrupt: "Corrupted Example",

    uncollectible: true,
    id: 41,
}

export default blueprint;

// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Taunt Example",
    stats: [2, 3],

    // The description doesn't really matter, but it's nice to explain what the card does.
    // The `&B` means Bold, and the `&R` means Reset. This just makes the word `Taunt.` bold, but nothing after it.
    // Look in `functions.parseTags` for a list of these tags.
    desc: "&BTaunt.&R This is an example card to show how to add keywords to cards.",

    mana: 1,
    type: "Minion",
    tribe: "Beast",
    classes: ["Neutral"],
    rarity: "Free",

    // This is an array of keywords. You could also do `keywords: ["Taunt", "Divine Shield"]` to also give the card divine shield, for example.
    keywords: ["Taunt"],

    uncollectible: true,
    id: 32,
}

export default blueprint;

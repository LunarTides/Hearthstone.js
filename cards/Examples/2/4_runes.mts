// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Rune Example",
    stats: [1, 2],
    desc: "This is an example card to show how runes work.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    runes: "FF", // You need 2 frost runes to use this card.
    uncollectible: true,
    id: 40,
}

export default blueprint;

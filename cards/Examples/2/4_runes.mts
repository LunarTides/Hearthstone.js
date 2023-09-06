// Created by Hand

import { Blueprint } from "../../../src/types.js";

export const blueprint: Blueprint = {
    name: "Rune Example",
    stats: [1, 2],
    desc: "This is an example card to show how runes work.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",

    // You need 2 frost runes and 1 blood rune to use this card.
    runes: "FFB",

    uncollectible: true,
    id: 40,
}

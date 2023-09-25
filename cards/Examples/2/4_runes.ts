// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Rune Example",
    stats: [1, 2],
    text: "This is an example card to show how runes work.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",

    // You need 2 frost runes and 1 blood rune to use this card.
    runes: "FFB",

    uncollectible: true,
    id: 39
}

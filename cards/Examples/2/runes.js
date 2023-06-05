// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Rune Example",
    stats: [1, 2],
    desc: "This is an example card to show how runes work.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    runes: "FF", // You need 2 frost runes to use this card.
    uncollectible: true
}

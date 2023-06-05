// Created by Hand

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Colossal Example", // There's a pun here somewhere
    stats: [5, 3],
    desc: "Colossal +2. Dredge.",
    mana: 2,
    type: "Minion",
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    colossal: ["Colossal Example Left Arm", "", "Colossal Example Right Arm"], // Put the names of the cards here. The "" is this card.
    /*
     * The board will look like this:
     * Left Arm
     * Colossal Example
     * Right Arm
     */
    uncollectible: true,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game) {
        game.interact.dredge();
    }
}

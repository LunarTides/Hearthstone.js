// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Novice Engineer",
    stats: [1, 1],
    desc: "Battlecry: Draw a card.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    id: 39,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, card) {
        plr.drawCard();
    }
}

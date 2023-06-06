// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Loot Hoarder",
    stats: [2, 1],
    desc: "Deathrattle: Draw a card.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",
    id: 38,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, card) {
        plr.drawCard();
    }
}

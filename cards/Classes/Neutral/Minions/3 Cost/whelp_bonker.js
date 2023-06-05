// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Whelp Bonker",
    stats: [1, 5],
    desc: "Frenzy and Honorable Kill: Draw a card.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    id: 46,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    frenzy(plr, game, self) {
        plr.drawCard();
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    honorablekill(plr, game, self) {
        plr.drawCard();
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Raza the Chained",
    stats: [5, 5],
    desc: "&BBattlecry:&R If your deck has no duplicates, your Hero Power costs (0) this game.",
    mana: 5,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "Mean Streets of Gadgetzan",
    id: 242,
    conditioned: ["battlecry"],

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        plr.heroPowerCost = 0;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}

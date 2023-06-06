// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Reno Jackson",
    stats: [4, 6],
    desc: "Battlecry: If your deck has no duplicates, fully heal your hero.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "League of Explorers",
    id: 157,
    conditioned: ["battlecry"],

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        plr.health = plr.maxHealth;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}

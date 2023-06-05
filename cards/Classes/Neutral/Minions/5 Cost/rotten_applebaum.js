// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Rotten Applebaum",
    stats: [4, 5],
    desc: "Taunt. Deathrattle: Restore 4 Health to your hero.",
    mana: 5,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Common",
    set: "The Witchwood",
    keywords: ["Taunt"],
    id: 208,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        plr.addHealth(4);
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Khartut Defender",
    stats: [3, 4],
    desc: "Taunt, Reborn. Deathrattle: Restore 3 Health to your hero.",
    mana: 6,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Rare",
    set: "Saviors of Uldum",
    keywords: ["Taunt", "Reborn"],
    id: 211,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        plr.addHealth(3);
    }
}

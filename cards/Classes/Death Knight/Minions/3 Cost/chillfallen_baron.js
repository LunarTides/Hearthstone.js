// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Chillfallen Baron",
    stats: [2, 2],
    desc: "Battlecry and Deathrattle: Draw a card.",
    mana: 3,
    type: "Minion",
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    id: 4,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        plr.drawCard();
    },
    
    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        plr.drawCard();
    }
}

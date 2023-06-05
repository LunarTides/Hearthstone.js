// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Cowardly Grunt",
    stats: [6, 2],
    desc: "Deathrattle: Summon a minion from your deck.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Warrior",
    rarity: "Rare",
    set: "United in Stormwind",
    id: 117,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        game.functions.recruit(plr);
    }
}

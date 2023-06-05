// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Gather Your Party",
    desc: "Recruit a minion.",
    mana: 6,
    type: "Spell",
    class: "Warrior",
    rarity: "Rare",
    set: "Kobolds & Catacombs",
    id: 118,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.functions.recruit(plr);
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Scale of Onyxia",
    desc: "Fill your board with 2/1 Whelps with Rush.",
    mana: 7,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Onyxia's Lair",
    id: 162,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        for (let i = 0; i < game.config.maxBoardSpace; i++) {
            let minion = new game.Card("Onyxian Whelp", plr);

            game.summonMinion(minion, plr);
        }
    }
}

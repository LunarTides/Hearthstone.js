// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Shard of the Naaru",
    desc: "Tradeable. Silence all enemy minions.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "United in Stormwind",
    keywords: ["Tradeable"],
    spellClass: "Holy",
    id: 173,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            m.silence();
        });
    }
}

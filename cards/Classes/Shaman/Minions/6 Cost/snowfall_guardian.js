// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Snowfall Guardian",
    stats: [5, 5],
    desc: "&Battlecry: Freeze&R all other minions.",
    mana: 6,
    type: "Minion",
    tribe: "Elemental",
    class: "Shaman",
    rarity: "Common",
    id: 309,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.freeze();
            });
        });
    }
}

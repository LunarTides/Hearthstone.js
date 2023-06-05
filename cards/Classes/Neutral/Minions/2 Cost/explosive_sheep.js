// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Explosive Sheep",
    stats: [1, 1],
    desc: "&BDeathrattle:&R Deal 2 damage to all minions.",
    mana: 2,
    type: "Minion",
    tribe: "Mech / Beast",
    class: "Neutral",
    rarity: "Common",
    set: "Goblins vs Gnomes",
    id: 295,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.remHealth(2);
            });
        });
    }
}

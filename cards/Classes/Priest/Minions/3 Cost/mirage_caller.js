// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Mirage Caller",
    stats: [2, 3],
    desc: "&BBattlecry:&R Choose a friendly minion. Summon a 1/1 copy of it.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Rare",
    id: 320,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Choose a friendly minion. Summon a 1/1 copy of it.", self, "friendly", "minion");
        if (!target) return -1;

        let copy = new game.Card(target.name, plr); // Create an imperfect copy
        copy.setStats(1, 1);

        game.summonMinion(copy, plr);
    }
}

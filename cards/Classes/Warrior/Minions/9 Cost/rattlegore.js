// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Rattlegore",
    stats: [9, 9],
    desc: "Deathrattle: Resummon this with -1/-1.",
    mana: 9,
    type: "Minion",
    tribe: "Undead",
    class: "Warrior",
    rarity: "Legendary",
    set: "Scholomance Academy",
    id: 133,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        let stats = self.backups.init.stats;

        let copy = new game.Card(self.name, plr);
        copy.stats = [stats[0] - 1, stats[1] - 1];
        copy.backups.init.stats = copy.stats;

        game.summonMinion(copy, plr);
    }
}

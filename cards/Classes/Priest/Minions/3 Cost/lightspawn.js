// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Lightspawn",
    stats: [0, 4],
    desc: "This minion's Attack is always equal to its Health.",
    mana: 3,
    type: "Minion",
    tribe: "Elemental",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    id: 64,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        self.setStats(self.getHealth(), self.getHealth());
    }
}

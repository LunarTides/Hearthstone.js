// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Serena Bloodfeather",
    stats: [1, 1],
    desc: "&BBattlecry:&R Choose an enemy minion. Steal Attack and Health from it until this has more.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "Forged in the Barrens",
    id: 236,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Choose an enemy minion. Steal Attack and Health from it until this has more.", self, "enemy", "minion");
        if (!target) return -1;

        do {
            // Steal attack and health
            self.addStats(1, 1);
            target.remStats(1, 1);
        } while (target.getAttack() > self.getAttack() || target.getHealth() > self.getHealth());
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Scaled Nightmare",
    stats: [2, 8],
    desc: "At the start of your turn, double this minion's Attack.",
    mana: 6,
    type: "Minion",
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Epic",
    set: "Whispers of the Old Gods",
    id: 54,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "StartTurn" || game.player == plr) return;

        self.addStats(self.getAttack(), 0);
    }
}

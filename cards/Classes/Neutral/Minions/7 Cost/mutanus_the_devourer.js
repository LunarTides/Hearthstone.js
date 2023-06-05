// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Mutanus the Devourer",
    stats: [4, 4],
    desc: "Battlecry: Eat a minion in your opponent's hand. Gain its stats.",
    mana: 7,
    type: "Minion",
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Legendary",
    set: "Wailing Caverns",
    id: 165,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = plr.getOpponent().hand.filter(c => c.type == "Minion");
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        game.functions.remove(plr.getOpponent().hand, minion);
        self.addStats(minion.getAttack(), minion.getHealth());
    }
}

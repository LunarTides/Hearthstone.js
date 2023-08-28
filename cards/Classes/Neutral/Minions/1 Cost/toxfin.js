// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Toxfin",
    stats: [1, 2],
    desc: "&BBattlecry:&R Give a friendly Murloc &BPoisonous&R.",
    mana: 1,
    type: "Minion",
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Common",
    id: 306,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self, "friendly", "minion");
        if (!target || !game.functions.matchTribe(target.tribe, "Murloc")) return -1;

        target.addKeyword("Poisonous");
    }
}

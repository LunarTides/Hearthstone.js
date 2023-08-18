// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Youthful Brewmaster",
    stats: [3, 2],
    desc: "Battlecry: Return a friendly minion from the battlefield to your hand.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",
    id: 40,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Choose a minion.", self, "friendly", "minion");

        if (!target) {
            return -1;
        }

        plr.addToHand(new game.Card(target.name, plr));
        target.destroy();
    }
}

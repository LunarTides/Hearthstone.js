// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Faceless Manipulator",
    stats: [3, 3],
    desc: "Battlecry: Choose a minion and become a copy of it.",
    mana: 5,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Epic",
    set: "Legacy",
    id: 51,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Become a copy of a minion.", self, null, "minion");
        if (!target) return -1;

        let clone = game.functions.cloneCard(target); // Create an exact copy of the target

        self.destroy();

        game.suppressedEvents.push("SummonMinion");
        game.summonMinion(clone, plr);
        game.suppressedEvents.pop();
    }
}

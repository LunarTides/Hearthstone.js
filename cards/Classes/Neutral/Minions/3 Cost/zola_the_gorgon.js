// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Zola the Gorgon",
    stats: [2, 2],
    desc: "Battlecry: Choose a friendly minion. Add a copy of it to your hand.",
    mana: 3,
    type: "Minion",
    tribe: "Naga",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",
    id: 47,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, card) {
        let target = game.interact.selectTarget("Add a copy of a minion to your hand.", true, "self", "minion");

        if (!target) {
            return -1;
        }

        let minion = new game.Card(target.name, plr);
        plr.addToHand(minion);
    }
}

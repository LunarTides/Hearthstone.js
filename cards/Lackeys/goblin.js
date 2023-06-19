// Created by Hand (before the Card Creator Existed)

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Goblin Lackey",
    stats: [1, 1],
    desc: "Battlecry: Give a friendly minion +1 Attack and Rush.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    battlecry(plr, game) {
        let target = game.interact.selectTarget("Give a friendly minion +1 Attack and Rush", "friendly", "minion");
        if (!target) return -1;

        target.addStats(1, 0);
        target.addKeyword("Rush");
    }
}

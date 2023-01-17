module.exports = {
    name: "Goblin Lackey",
    stats: [1, 1],
    desc: "Battlecry: Give a friendly minion +1 Attack and Rush.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 90,

    battlecry(plr, game) {
        let target = game.interact.selectTarget("Give a friendly minion +1 Attack and Rush", "friendly", "minion");
        if (!target) return -1;

        target.addStats(1, 0);
        target.addKeyword("Rush");
    }
}

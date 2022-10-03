module.exports = {
    name: "Goblin Lackey",
    stats: [1, 1],
    desc: "Battlecry: Give a friendly minion +1 Attack and Rush.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game) {
        var target = game.functions.selectTarget("Give a friendly minion +1 Attack and Rush", "friendly", "minion");

        target.addStats(1, 0);
        target.addKeyword("Rush");
    }
}
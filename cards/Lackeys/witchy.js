module.exports = {
    name: "Witchy Lackey",
    stats: [1, 1],
    desc: "Battlecry: Transform a friendly minion into one that costs (1) more.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 92,

    battlecry(plr, game, minion) {
        let target = game.interact.selectTarget("Transform a friendly minion into one that costs (1) more.", "friendly", "minion");
        if (!target || target.mana >= 10) return -1;

        let minions = game.functions.getCards().filter(card => card.type === "Minion" && card.mana === target.mana + 1);
        let rand = game.functions.randList(minions);

        game.summonMinion(new game.Card(rand.name, plr), plr);
        
        target.destroy();
    }
}

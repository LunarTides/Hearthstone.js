module.exports = {
    name: "Witchy Lackey",
    stats: [1, 1],
    desc: "Battlecry: Transform a friendly minion into one that costs (1) more.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game, minion) {
        var target = game.functions.selectTarget("Transform a friendly minion into one that costs (1) more.", "friendly", "minion");
        if (target.mana >= 10) return -1;

        let minions = Object.values(game.cards).filter(card => card.type === "Minion" && card.mana === target.mana + 1);
        minions = game.functions.accountForUncollectible(minions);
        let rand = game.functions.randList(minions);

        game.summonMinion(new game.Card(rand.name, plr), plr);
        
        target.destroy();
    }
}
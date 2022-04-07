module.exports = {
    name: "Witchy Lackey",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Transform a friendly minion into one that costs (1) more.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game, minion) {
        var target = game.functions.selectTarget("Transform a friendly minion into one that costs (1) more.", "friendly", "minion");

        if (target.mana < 10) {
            let minions = Object.values(game.cards).filter(card => card.type === "Minion" && card.mana === target.mana + 1);
            let rand = game.functions.randList(minions);
            console.log(rand)

            game.playMinion(new game.Minion(rand.name), plr);
            
            target.silence();
            target.stats = [0, 0];
            game.killMinions();
        }
    }
}
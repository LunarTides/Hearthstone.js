module.exports = {
    name: "Dirty Rat",
    stats: [2, 6],
    desc: "Taunt. Battlecry: Your opponent summons a random minion from their hand.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Epic",
    set: "Mean Streets of Gadgetzan",
    keywords: ["Taunt"],
    id: 150,

    battlecry(plr, game, self) {
        let list = plr.getOpponent().hand.filter(c => c.type == "Minion");
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        game.summonMinion(minion, plr.getOpponent());
    }
}
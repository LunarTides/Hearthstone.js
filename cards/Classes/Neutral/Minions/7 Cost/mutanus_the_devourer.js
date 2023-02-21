module.exports = {
    name: "Mutanus the Devourer",
    stats: [4, 4],
    desc: "Battlecry: Eat a minion in your opponent's hand. Gain its stats.",
    mana: 7,
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Legendary",
    set: "Wailing Caverns",
    id: 165,

    battlecry(plr, game, self) {
        let minion = game.functions.randList(plr.getOpponent().hand, false);
        if (!minion) return;

        game.functions.remove(plr.getOpponent().hand, minion);

        self.addStats(minion.getAttack(), minion.getHealth());
    }
}

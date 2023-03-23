module.exports = {
    name: "Brilliant Macaw",
    stats: [3, 3],
    desc: "&BBattlecry:&R Repeat the last &BBattlecry&R you played.",
    mana: 3,
    tribe: "Beast",
    class: "Shaman",
    rarity: "Common",
    id: 313,

    battlecry(plr, game, self) {
        let cardsPlayed = game.stats.cardsPlayed[plr.id];
        cardsPlayed = cardsPlayed.map(c => c[0]).filter(c => c.battlecry && c.id != self.id);
        if (cardsPlayed.length <= 0) return;

        let minion = cardsPlayed[cardsPlayed.length - 1];
        minion.activateBattlecry();
    }
}

module.exports = {
    name: "Bolner Hammerbeak",
    stats: [1, 4],
    desc: "After you play a &BBattlecry&R minion, repeat the first &BBattlecry&R played this turn.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 312,

    passive(plr, game, self, key, val) {
        if (key != "PlayCard") return;
        if (val.type != "Minion" || !val.battlecry) return;

        // Repeat the first Battlecry played this turn.
        let cardsPlayed = game.events.PlayCard[plr.id];
        cardsPlayed = cardsPlayed.filter(c => c[1] == game.turns && c[0].battlecry && c[0] != val).map(c => c[0]);

        let minion = game.functions.randList(cardsPlayed);
        if (!minion) return;

        minion.activateBattlecry();
    }
}

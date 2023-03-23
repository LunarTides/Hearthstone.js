module.exports = {
    name: "Frozen Zentimo",
    stats: [1, 3],
    desc: "Whenever you target a minion with a spell, freeze its neighbors.",
    mana: 3,
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 316,

    passive(plr, game, self, key, val) {
        // I know this isn't exactly what Zentimo does but the og description was impossible to implement.
        // This desc does the same for this deck anyways
        if (key != "spellsCastOnMinions") return;

        let b = game.board[val.plr.id];
        let index = b.indexOf(val);
        if (index === -1) return;

        if (index > 0) b[index - 1].freeze();
        if (index < b.length - 1) b[index + 1].freeze();
    }
}

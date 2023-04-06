module.exports = {
    name: "Zentimo",
    stats: [1, 3],
    desc: "Whenever you target a minion with a spell, it also targets adjacent ones.",
    mana: 3,
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 316,

    passive(plr, game, self, key, val) {
        if (key != "cardsPlayedUnsafe" && val != self) return;

        let enabled = true;
        let minion;

        game.functions.addPassive("spellsCastOnMinions", (_key, _val) => {
            minion = _val;
            return true;
        }, () => {
            if (!enabled) return true;

            let b = game.board[minion.plr.id];
            let index = b.indexOf(minion);
            if (index === -1) return true;

            if (index > 0) {
                plr.forceTarget = b[index - 1];
                val.activate("cast");
            }

            if (index < b.length - 1) {
                plr.forceTarget = b[index + 1];
                val.activate("cast");
            }

            plr.forceTarget = null;

            return true;
        }, 1);

        // Undo after cast function was called
        game.functions.addPassive("cardsPlayed", (_key, _val) => {
            return _val == val;
        }, () => {
            enabled = false;
            return true;
        }, 1);
    }
}

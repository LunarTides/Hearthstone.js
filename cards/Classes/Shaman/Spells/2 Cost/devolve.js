module.exports = {
    name: "Devolve",
    desc: "Transform all enemy minions into random ones that cost (1) less.",
    mana: 2,
    class: "Shaman",
    rarity: "Rare",
    spellClass: "Nature",
    id: 304,

    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            let list = game.functions.getCards();
            list = list.filter(c => game.functions.getType(c) == "Minion" && c.mana == m.mana - 1);

            let minion = game.functions.randList(list);
            if (!minion) return;
            minion = new game.Card(minion.name, plr);

            m.destroy();
            game.summonMinion(minion, plr.getOpponent());
        });
    }
}

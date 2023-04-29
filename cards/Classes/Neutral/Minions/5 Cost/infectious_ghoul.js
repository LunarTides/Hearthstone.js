module.exports = {
    name: "Infectious Ghoul",
    stats: [5, 4],
    desc: "Deathrattle: Give a random friendly minion \"Deathrattle: Summon an Infectious Ghoul.\"",
    mana: 5,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Rare",
    set: "March of the Lich King",
    id: 207,

    deathrattle(plr, game, self) {
        let list = game.board[plr.id].filter(m => m != self);
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        const deathrattle = (plr, game, self) => {
            let minion = new game.Card("Infectious Ghoul", plr);
            game.summonMinion(minion, plr);
        }

        minion.addDeathrattle(deathrattle);
    }
}

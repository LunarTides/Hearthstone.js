module.exports = {
    name: "NZoth the Corruptor",
    displayName: "N'Zoth, the Corruptor",
    stats: [5, 7],
    desc: "Battlecry: Summon your Deathrattle minions that died this game.",
    mana: 10,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Whispers of the Old Gods",
    id: 213,

    battlecry(plr, game, self) {
        let amount = game.board[plr.id].length + 1;

        game.graveyard[plr.id].forEach(m => {
            if (!m.deathrattle || false || amount >= 7) return;

            let minion = new game.Card(m.name, plr);
            game.summonMinion(minion, plr);

            amount++;
        });
    }
}

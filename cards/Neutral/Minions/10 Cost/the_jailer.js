module.exports = {
    name: "The Jailer",
    stats: [10, 10],
    desc: "Battlecry: Destroy your deck. For the rest of the game, your minions are Immune.",
    mana: 10,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Murder at Castle Nathria",
            
    battlecry(plr, game, card) {
        plr.deck = [];

        game.passives.push((_game, trigger) => {
            _game.board[plr.id].forEach(m => m.immune = true);
        });
    }
}

module.exports = {
    name: "Varden Dawngrasp",
    stats: [3, 3],
    desc: "&BBattlecry: Freeze&R all enemy minions. If any are already &BFrozen&R, deal 4 damage to them instead.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Mage",
    rarity: "Legendary",
    id: 319,

    battlecry(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            if (m.frozen) game.attack(4, m);
            else m.freeze();
        });
    }
}

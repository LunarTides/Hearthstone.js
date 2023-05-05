module.exports = {
    name: "Mechathun",
    displayName: "Mecha'thun",
    stats: [10, 10],
    desc: "Deathrattle: If you have no cards in your deck, hand, and battlefield, destroy the enemy hero.",
    mana: 10,
    type: "Minion",
    tribe: "Mech",
    class: "Neutral",
    rarity: "Legendary",
    set: "The Boomsday Project",
    id: 57,

    deathrattle(plr, game, card) {
        // This deathrattle gets called before the minion is removed from the board, so the board's length should be 1
        if (plr.deck.length == 0 && plr.hand.length == 0 && game.board[plr.id].length == 1) game.endGame(plr);
    }
}

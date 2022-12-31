module.exports = {
    name: "Mechathun",
    displayName: "Mecha'thun",
    stats: [10, 10],
    desc: "Deathrattle: If you have no cards in your deck, hand, and battlefield, destroy the enemy hero.",
    mana: 10,
    tribe: "Mech",
    class: "Neutral",
    rarity: "Legendary",
    set: "The Boomsday Project",

    deathrattle(plr, game, card) {
        if (plr.deck.length == 0 && plr.hand.length == 0 && game[plr.id].length == 1) game.endGame(plr);
    }
}

module.exports = {
    name: "Augmented Elekk",
    stats: [3, 4],
    desc: "Whenever you shuffle a card into a deck, shuffle in an extra copy.",
    mana: 3,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Epic",
    set: "The Boomsday Project",
    id: 42,

    passive(plr, game, card, key, val) {
        if (!card.passiveCheck([key, val], "cardsAddedToDeck", null, plr)) return;
        
        plr.shuffleIntoDeck(val, false);
    }
}

module.exports = {
    name: "Sir Finley Sea Guide",
    displayName: "Sir Finley, Sea Guide",
    stats: [1, 3],
    desc: "&BBattlecry:&R Swap your hand with the bottom of your deck.",
    mana: 1,
    type: "Minion",
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Legendary",
    set: "Voyage to the Sunken City",
    id: 233,

    battlecry(plr, game, self) {
        let bottom_of_deck = plr.deck.splice(0, plr.hand.length);

        // Add player's hand to the bottom of their deck.
        plr.hand.forEach(c => {
            plr.deck.unshift(c);
        });

        plr.hand = bottom_of_deck;
    }
}

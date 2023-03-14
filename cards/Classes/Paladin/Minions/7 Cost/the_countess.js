module.exports = {
    name: "The Countess",
    stats: [7, 7],
    desc: "&BBattlecry: &RIf your deck has no Neutral cards, add 3 &BLegendary&R Invitations to your hand.",
    mana: 7,
    tribe: "None",
    class: "Paladin",
    rarity: "Legendary",
    set: "Murder at Castle Nathria",
    id: 268,

    battlecry(plr, game, self) {
        // Check for Neutral cards.
        let neutral_cards = plr.deck.filter(c => c.class.includes("Neutral"));
        if (neutral_cards.length > 0) return;

        // There are no neutral cards in the player's deck.
        for (let i = 0; i < 3; i++) {
            let card = new game.Card("Legendary Invitation", plr);

            plr.addToHand(card);
        }
    }
}

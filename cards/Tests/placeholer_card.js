module.exports = {
    name: "Card Placeholder Test",
    stats: [1, 1],
    desc: "&BBattlecry:&R Become a copy of the last card in your hand. (Currently {card})",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    battlecry(plr, game, self) {
        if (plr.hand.length <= 0) return;

        let card = plr.hand[plr.hand.length - 1];

        self.destroy();
        game.summonMinion(card.perfectCopy(), plr);
    },

    placeholders(plr, game, self) {
        let card = "placeholder";

        // Subtract 1 to account for this card
        if ((plr.hand.length - 1) > 0) {
            let hand = plr.hand.filter(c => c !== self);
            //let hand = plr.hand;
            card = hand[hand.length - 1];
        }

        return {"card": card};
    }
}

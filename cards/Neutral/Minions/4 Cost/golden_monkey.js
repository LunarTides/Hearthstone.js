module.exports = {
    name: "Golden Monkey",
    stats: [6, 6],
    desc: "Taunt. Battlecry: Replace your hand and deck with Legendary minions.",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Core",
    keywords: ["Taunt"],
    uncollectible: true,

    battlecry(plr, game, card) {
        let new_hand = [];
        let new_deck = [];

        let possible_cards = game.functions.accountForUncollectible(Object.values(game.cards).filter(c => c.rarity == "Legendary" && game.functions.getType(c) == "Minion"));

        plr.hand.forEach(c => {
            let card = game.functions.randList(possible_cards);
            new_hand.push(new game.Minion(card.name, plr));
        });

        plr.deck.forEach(c => {
            let card = game.functions.randList(possible_cards);
            new_deck.push(new game.Minion(card.name, plr));
        });

        plr.setHand(new_hand);
        plr.setDeck(new_deck);
    }
}
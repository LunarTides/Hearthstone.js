module.exports = {
    name: "Duke Theotar",
    displayName: "Theotar, the Mad Duke",
    stats: [4, 4],
    desc: "Battlecry: Discover a card in each player's hand and swap them.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Murder at Castle Nathria",
    id: 167,

    battlecry(plr, game, self) {
        let opHand = plr.getOpponent().hand;

        if (plr.hand.length <= 0 || opHand.length <= 0) return;

        let opCard = game.interact.discover("Discover a card in your opponent's hand.", opHand);
        let plrCard = game.interact.discover("Discover a card in your hand.", plr.hand);

        // Remove the cards from the player's hands
        game.functions.remove(plr.getOpponent().hand, opCard);
        game.functions.remove(plr.hand, plrCard);

        opCard.plr = plr;
        plrCard.plr = plr.getOpponent();

        // Add the cards
        plr.getOpponent().addToHand(game.functions.cloneCard(plrCard));
        plr.addToHand(game.functions.cloneCard(opCard));
    }
}

module.exports = {
    name: "Secret Passage",
    desc: "Replace your hand with 4 cards from your deck. Swap back next turn.",
    mana: 1,
    class: "Rogue",
    rarity: "Epic",
    set: "Scholomance Academy",
    id: 274,

    cast(plr, game, self) {
        // Store the state of the player's hand for later
        let og_hand = plr.hand.slice(); // Do .slice() to make a copy of it instead of ref
        plr.hand = [];

        // Put 4 cards from your deck into your hand.
        for (let i = 0; i < 4; i++) {
            let card = game.functions.randList(plr.deck, false);

            plr.drawSpecific(card);
        }

        // Swap back next turn
        game.functions.addPassive("turnEnds", () => {return true}, () => {
            // Put the player's hand into their deck
            plr.hand.forEach(c => {
                plr.shuffleIntoDeck(c);
            });

            plr.hand = og_hand;
        }, 1);
    }
}

// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Discover Example",
    desc: "Discover a spell.",
    mana: 1,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        // The discover function needs a list of cards to choose from.
        // This list will act like a pool of cards.
        let cards = game.functions.getCards(); // This gets every card from the game, excluding uncollectible cards.
        cards = cards.filter(c => c.type == "Spell"); // We need to filter away any non-spell cards. Keep in mind that `getCards` returns a list of Blueprints, not a list of Cards. What you are looking at now is a Blueprint, so we can access the `type` variable since if you look up, this Blueprint has the `type` variable.

        // interact.discover(prompt, pool, if_it_should_filter_away_cards_that_are_not_the_players_class = true, amount_of_cards_to_choose_from = 3)
        let spell = game.interact.discover("Discover a spell", cards);
        if (!spell) return -1;

        // Now we need to actually add the card to the player's hand
        plr.addToHand(spell);
    }
}

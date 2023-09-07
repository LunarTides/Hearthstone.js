// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Discover Example",
    desc: "Discover a spell.",
    mana: 1,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 51,

    cast(plr, game, self) {
        // The discover function needs a list of cards to choose from.
        // This list will act like a pool of cards.

        // This gets every card from the game, excluding uncollectible cards.
        let cards = game.functions.getCards();

        // We need to filter away any non-spell cards.
        // Keep in mind that `getCards` returns a list of Blueprints, not a list of Cards.
        // What you are looking at now is a Blueprint, so we can access the `type` variable since if you look up, this Blueprint has the `type` variable.
        cards = cards.filter(c => c.type == "Spell"); 

        // interact.discover(prompt, pool, if_it_should_filter_away_cards_that_are_not_the_players_class = true, amount_of_cards_to_choose_from = 3)
        let spell = game.interact.discover("Discover a spell", cards);

        // If no card was chosen, refund
        if (!spell) return game.constants.REFUND;

        // Now we need to actually add the card to the player's hand
        plr.addToHand(spell);
        return true;
    }
}

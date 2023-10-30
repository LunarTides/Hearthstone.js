// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Discover Example',
    text: 'Discover a spell.',
    cost: 1,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 51,

    cast(plr, self) {
        // Discover a spell.

        // The discover function needs a list of cards to choose from.
        // This list will act like a pool of cards.

        // This gets every card from the game, excluding uncollectible cards.
        let pool = game.functions.card.getAll();

        // We need to filter away any non-spell cards.
        pool = pool.filter(c => c.type === 'Spell');

        // Interact.discover(prompt, pool, ifItShouldFilterAwayCardsThatAreNotThePlayersClass = true, amountOfCardsToChooseFrom = 3)
        const SPELL = game.interact.card.discover('Discover a spell.', pool);

        // If no card was chosen, refund
        if (!SPELL) {
            return game.constants.REFUND;
        }

        // Now we need to actually add the card to the player's hand
        plr.addToHand(SPELL);
        return true;
    },

    test(plr, self) {
        plr.inputQueue = '1';
        plr.hand = [];

        for (let i = 0; i < 50; i++) {
            self.activate('cast');

            const CARD = plr.hand.pop();
            assert.equal(CARD?.type, 'Spell');
            assert(Boolean(CARD) && game.functions.card.validateClasses(CARD!.classes, plr.heroClass));
        }
    },
};

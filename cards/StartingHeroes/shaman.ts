// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Shaman Starting Hero',
    displayName: 'Thrall',
    text: 'Shaman starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Summon a random Totem.',
    hpCost: 2,
    classes: ['Shaman'],
    rarity: 'Free',
    uncollectible: true,
    id: 9,

    heropower(plr, self) {
        // The names of the cards that can be summoned
        const TOTEM_CARD_NAMES = ['Healing Totem', 'Searing Totem', 'Stoneclaw Totem', 'Strength Totem'];

        // Filter away totem cards that is already on the player's side of the board.
        const FILTERED_TOTEM_CARD_NAMES = TOTEM_CARD_NAMES.filter(name => !game.board[plr.id].some(m => m.name === name));

        // If there are no totem cards to summon, refund the hero power, which gives the player back their mana
        if (FILTERED_TOTEM_CARD_NAMES.length === 0) {
            return game.constants.REFUND;
        }

        // Randomly choose one of the totem cards.
        const CARD_NAME = game.lodash.sample(FILTERED_TOTEM_CARD_NAMES);
        if (!CARD_NAME) {
            throw game.functions.card.createCardError('null found when randomly choosing totem card name');
        }

        // Create a card from the name.
        const CARD = game.createCard(CARD_NAME, plr);

        // Summon the card on the player's side of the board
        game.summonMinion(CARD, plr);
        return true;
    },

    test(plr, self) {
        const TOTEM_CARD_NAMES = ['Healing Totem', 'Searing Totem', 'Stoneclaw Totem', 'Strength Totem'];
        const checkForTotemCard = (amount: number) => game.board[plr.id].filter(card => TOTEM_CARD_NAMES.includes(card.name)).length === amount;

        // There should be 0 totem cards on the board
        assert(checkForTotemCard(0));

        for (let index = 1; index <= TOTEM_CARD_NAMES.length + 1; index++) {
            self.activate('heropower');

            // If all totem cards are on the board, it shouldn't summon a new one
            if (index > TOTEM_CARD_NAMES.length) {
                assert(checkForTotemCard(index - 1));
                continue;
            }

            // There should be 'index' totem cards on the board
            assert(checkForTotemCard(index));
        }

        // Assert that all of the totem cards are on the board
        for (const NAME of TOTEM_CARD_NAMES) {
            assert(game.board[plr.id].some(card => card.name === NAME));
        }

        // Assert that the board's length is equal to the amount of totem cards.
        assert.equal(game.board[plr.id].length, TOTEM_CARD_NAMES.length);
    },
};

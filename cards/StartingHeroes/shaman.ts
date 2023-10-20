// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
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
        const totemCardNames = ['Healing Totem', 'Searing Totem', 'Stoneclaw Totem', 'Strength Totem'];
        const filteredTotemCardNames: string[] = [];

        // Filter away totem cards that is already on the player's side of the board.
        for (const name of totemCardNames) {
            // If the board already has a totem with this name, return
            if (game.board[plr.id].some(m => m.name === name)) {
                continue;
            }

            filteredTotemCardNames.push(name);
        }

        // If there are no totem cards to summon, refund the hero power, which gives the player back their mana
        if (filteredTotemCardNames.length === 0) {
            return game.constants.refund;
        }

        // Randomly choose one of the totem cards.
        const cardName = game.lodash.sample(filteredTotemCardNames);
        if (!cardName) {
            throw game.functions.card.createCardError('null found when randomly choosing totem card name');
        }

        // Create a card from the name.
        const card = game.createCard(cardName, plr);

        // Summon the card on the player's side of the board
        game.summonMinion(card, plr);
        return true;
    },

    test(plr, self) {
        const totemCardNames = ['Healing Totem', 'Searing Totem', 'Stoneclaw Totem', 'Strength Totem'];
        const checkForTotemCard = (amount: number) => game.board[plr.id].filter(card => totemCardNames.includes(card.name)).length === amount;

        // There should be 0 totem cards on the board
        assert(checkForTotemCard(0));

        for (let index = 1; index <= totemCardNames.length + 1; index++) {
            self.activate('heropower');

            // If all totem cards are on the board, it shouldn't summon a new one
            if (index > totemCardNames.length) {
                assert(checkForTotemCard(index - 1));
                continue;
            }

            // There should be 'index' totem cards on the board
            assert(checkForTotemCard(index));
        }

        // Assert that all of the totem cards are on the board
        for (const name of totemCardNames) {
            assert(game.board[plr.id].some(card => card.name === name));
        }

        // Assert that the board's length is equal to the amount of totem cards.
        assert.equal(game.board[plr.id].length, totemCardNames.length);
    },
};

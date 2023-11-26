// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Galakrond\'s Guile',
    text: 'Add a <b>Lackey</b> to your hand.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Rogue'],
    rarity: 'Legendary',
    id: 125,

    cast(plr, self) {
        // Add a lacky to your hand.
        const lackeyId = game.lodash.sample(game.cardCollections.lackeys);
        if (!lackeyId) {
            return;
        }

        const lackey = game.createCard(lackeyId, plr);

        plr.addToHand(lackey);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';
import { type Card } from '../../../src/core/card.js';

export const blueprint: Blueprint = {
    name: 'Galakrond\'s Malice',
    text: 'Summon two 1/1 Imps.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Warlock'],
    rarity: 'Legendary',
    id: 129,

    cast(plr, self) {
        // Summon two 1/1 Imps.
        for (let i = 0; i < 2; i++) {
            const card = game.createCard(21, plr);
            if (!card) {
                break;
            }

            game.summonMinion(card, plr);
        }
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

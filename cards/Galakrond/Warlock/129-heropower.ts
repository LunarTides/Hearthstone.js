// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Galakrond\'s Malice',
    text: 'Summon two 1/1 Imps.',
    cost: 2,
    type: 'Heropower',
    classes: ['Warlock'],
    rarity: 'Legendary',
    collectible: true,
    id: 129,

    heropower(plr, self) {
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

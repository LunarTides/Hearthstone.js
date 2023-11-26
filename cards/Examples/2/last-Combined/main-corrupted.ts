// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Combined Example 2 Corrupted',
    stats: [9, 9],
    text: 'Colossal +2. Dormant. Corrupted. <b>Battlecry: Dredge.</b>',
    cost: 0,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Legendary',
    uncollectible: true,
    id: 49,

    create(plr, self) {
        self.addKeyword('Colossal', [46, 0, 47]);
        self.addKeyword('Dormant', 2);
    },

    battlecry(plr, self) {
        // Dredge.

        game.interact.card.dredge();
    },
};

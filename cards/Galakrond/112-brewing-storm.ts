// Created by the Vanilla Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Brewing Storm',
    stats: [2, 2],
    text: '<b>Rush</b>',
    cost: 2,
    type: 'Minion',
    tribe: 'Elemental',
    classes: ['Shaman'],
    rarity: 'Free',
    uncollectible: true,
    id: 112,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Rush');
    },
};

// Created by the Vanilla Card Creator

// This is the Flipper Friends Otter card

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Otter',
    stats: [1, 1],
    text: '<b>Rush</b>',
    cost: 1,
    type: 'Minion',
    tribe: 'Beast',
    classes: ['Druid'],
    rarity: 'Free',
    uncollectible: true,
    id: 95,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Rush');
    },
};
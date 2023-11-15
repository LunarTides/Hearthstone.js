// Created by the Vanilla Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Flipper Friends Otter',
    stats: [1, 1],
    text: '<b>Rush</b>',
    cost: 1,
    type: 'Minion',
    tribe: 'Beast',
    classes: ['Druid'],
    rarity: 'Free',
    uncollectible: true,
    displayName: 'Otter',
    id: 91,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Rush');
    },
};

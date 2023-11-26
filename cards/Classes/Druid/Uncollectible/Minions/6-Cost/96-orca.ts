// Created by the Vanilla Card Creator

// This is the Flipper Friends Orca card

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Orca',
    stats: [6, 6],
    text: '<b>Taunt</b>',
    cost: 6,
    type: 'Minion',
    tribe: 'Beast',
    classes: ['Druid'],
    rarity: 'Free',
    uncollectible: true,
    id: 96,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Taunt');
    },
};

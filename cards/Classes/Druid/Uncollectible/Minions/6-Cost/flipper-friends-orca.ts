// Created by the Vanilla Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Flipper Friends Orca',
    stats: [6, 6],
    text: '<b>Taunt</b>',
    cost: 6,
    type: 'Minion',
    tribe: 'Beast',
    classes: ['Druid'],
    rarity: 'Free',
    uncollectible: true,
    displayName: 'Orca',
    id: 96,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Taunt');
    },
};

// Created by the Vanilla Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Onyxian Whelp',
    text: '<b>Rush</b>',
    cost: 1,
    type: 'Minion',
    attack: 2,
    health: 1,
    tribe: 'Dragon',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 99,

    create(plr, self) {
        // Add additional fields here
        self.addKeyword('Rush');
    },
};

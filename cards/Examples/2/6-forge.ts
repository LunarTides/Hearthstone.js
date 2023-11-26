// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Forge Example',
    stats: [1, 1],
    text: '<b>Forge:</b> Gain +1/+1.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 75,

    create(plr, self) {
        // Put the id of the forged counterpart, like in corrupt.
        self.addKeyword('Forge', 76);
    },
};

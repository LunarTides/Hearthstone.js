// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    // This looks like a minion card except for the type.
    name: 'Weapon Example',
    stats: [5, 3],
    text: 'Just an example card (Does nothing)',
    cost: 1,
    type: 'Weapon',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 31,
};

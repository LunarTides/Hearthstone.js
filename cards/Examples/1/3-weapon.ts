// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    // This looks like a minion card except for the type.
    name: 'Weapon Example',
    text: 'Just an example card (Does nothing)',
    cost: 1,
    type: 'Weapon',
    attack: 5,
    health: 3,
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 31,
};

// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    // This looks like a minion card except for the type and no tribe.
    name: 'Weapon Example',
    text: 'Just an example card (Does nothing)',
    cost: 1,
    type: 'Weapon',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 31,

    attack: 5,
    health: 3,
};

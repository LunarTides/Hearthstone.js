// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Spell Example',
    text: 'Just an example card (Does nothing)',
    cost: 1,
    type: 'Spell',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 30,

    // The school of the spell.
    spellSchool: 'Shadow',
};

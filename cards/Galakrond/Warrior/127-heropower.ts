// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Galakrond\'s Might',
    text: 'Give your hero +3 Attack this turn.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Warrior'],
    rarity: 'Legendary',
    id: 127,

    cast(plr, self) {
        // Give your hero +3 Attack this turn.

        plr.attack += 3;
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};
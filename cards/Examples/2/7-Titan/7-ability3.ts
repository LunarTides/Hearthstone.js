// Created by Hand (before the Card Creator Existed)

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    // Look in `titan.ts` first.
    name: 'Ability 3',
    text: 'Restore 2 mana.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 81,

    cast(plr, self) {
        // Restore 2 mana.

        plr.refreshMana(2);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};


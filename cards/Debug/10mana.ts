// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: '10 Mana',
    text: 'Gain 10 Mana.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 65,

    cast(plr, self) {
        // Gain 10 Mana.
        plr.addMana(10);
    },

    test(plr, self) {
        plr.mana = 5;
        self.activate('cast');

        assert.equal(plr.mana, 10);
    },
};

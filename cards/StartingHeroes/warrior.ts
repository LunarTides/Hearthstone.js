// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Warrior Starting Hero',
    displayName: 'Garrosh Hellscream',
    text: 'Warrior starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Gain 2 Armor.',
    hpCost: 2,
    classes: ['Warrior'],
    rarity: 'Free',
    uncollectible: true,
    id: 7,

    heropower(plr, self) {
        // Gain 2 Armor.

        // Give the player +2 armor.
        plr.addArmor(2);
    },

    test(plr, self) {
        // The player should have 0 armor
        assert.equal(plr.armor, 0);
        self.activate('heropower');

        // The player should now have 2 armor
        assert.equal(plr.armor, 2);
    },
};

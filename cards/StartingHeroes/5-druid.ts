// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Malfurion Stormrage',
    text: 'Druid starting hero',
    cost: 0,
    type: 'Hero',
    hpText: '+1 Attack this turn. +1 Armor',
    hpCost: 2,
    classes: ['Druid'],
    rarity: 'Free',
    uncollectible: true,
    id: 5,

    heropower(plr, self) {
        // +1 Attack this turn. +1 Armor.

        // Give the player +1 attack.
        plr.addAttack(1);

        // Give the player +1 armor.
        plr.addArmor(1);
    },

    test(plr, self) {
        // The player should start with 0 attack
        assert.equal(plr.attack, 0);
        assert.equal(plr.armor, 0);
        self.activate('heropower');

        // The player should gain 1 attack
        assert.equal(plr.attack, 1);
        assert.equal(plr.armor, 1);
    },
};
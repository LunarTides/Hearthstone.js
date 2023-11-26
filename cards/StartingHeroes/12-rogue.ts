// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';
import { type Card } from '../../src/core/card.js';

export const blueprint: Blueprint = {
    name: 'Valeera Sanguinar',
    text: 'Rogue starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Equip a 1/2 Dagger.',
    hpCost: 2,
    classes: ['Rogue'],
    rarity: 'Free',
    uncollectible: true,
    id: 12,

    heropower(plr, self) {
        // Equip a 1/2 Dagger.

        // Create the weapon card
        const weapon = game.createCard(22, plr);

        // Equip the weapon
        plr.setWeapon(weapon);
    },

    test(plr, self) {
        // The player should not have a weapon
        assert.equal(plr.weapon, undefined);
        self.activate('heropower');

        // The player should now have the wicked knife weapon
        assert.ok(plr.weapon);
        assert.equal(plr.weapon.id, 22);
    },
};
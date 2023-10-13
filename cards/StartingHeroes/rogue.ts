// Created by the Custom Card Creator

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';
import {type Card} from '../../src/core/card.js';

export const blueprint: Blueprint = {
    name: 'Rogue Starting Hero',
    displayName: 'Valeera Sanguinar',
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
        const wpn = game.createCard('Wicked Knife', plr);

        // Equip the weapon
        plr.setWeapon(wpn);
    },

    test(plr, self) {
        // The player should not have a weapon
        assert.equal(plr.weapon, undefined);
        self.activate('heropower');

        // The player should now have the wicked knife weapon
        assert.equal((plr.weapon)?.name, 'Wicked Knife');
    },
};

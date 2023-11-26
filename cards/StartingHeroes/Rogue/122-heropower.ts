// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Dagger Mastery',
    text: 'Equip a 1/2 Dagger.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Rogue'],
    rarity: 'Free',
    uncollectible: true,
    id: 122,

    cast(plr, self) {
        // Equip a 1/2 Dagger.

        // Create the weapon card
        const weapon = game.createCard(22, plr);

        // Equip the weapon
        plr.setWeapon(weapon);
    },

    test(plr, self) {
        // The player should not have a weapon
        assert.equal(plr.weapon, undefined);
        self.activate('cast');

        // The player should now have the wicked knife weapon
        assert.ok(plr.weapon);
        assert.equal(plr.weapon.id, 22);
    },
};

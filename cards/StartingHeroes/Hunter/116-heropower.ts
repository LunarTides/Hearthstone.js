// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Steady Shot',
    text: 'Deal 2 damage to the enemy hero.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Hunter'],
    rarity: 'Free',
    collectible: false,
    id: 116,

    cast(plr, self) {
        // Deal 2 damage to the enemy hero.
        game.attack(2, plr.getOpponent());
    },

    test(plr, self) {
        // The opponent should have 30 health
        assert.equal(plr.getOpponent().getHealth(), 30);
        self.activate('cast');

        // The opponent should now have 28 health.
        assert.equal(plr.getOpponent().getHealth(), 30 - 2);
    },
};

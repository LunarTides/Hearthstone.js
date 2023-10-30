// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Hunter Starting Hero',
    displayName: 'Rexxar',
    text: 'Hunter starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Deal 2 damage to the enemy hero.',
    hpCost: 2,
    classes: ['Hunter'],
    rarity: 'Free',
    uncollectible: true,
    id: 6,

    heropower(plr, self) {
        // Deal 2 damage to the enemy hero.
        game.attack(2, plr.getOpponent());
    },

    test(plr, self) {
        // The opponent should have 30 health
        assert.equal(plr.getOpponent().getHealth(), 30);
        self.activate('heropower');

        // The opponent should now have 28 health.
        assert.equal(plr.getOpponent().getHealth(), 30 - 2);
    },
};

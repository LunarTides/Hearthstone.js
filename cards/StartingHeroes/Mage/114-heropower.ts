// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Fireblast',
    text: 'Deal 1 damage.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Mage'],
    rarity: 'Free',
    uncollectible: true,
    id: 114,

    cast(plr, self) {
        // Deal 1 damage.

        // Use of `selectTarget` in the `heropower` ability requires the use of the `forceElusive` flag
        const target = game.interact.selectTarget('Deal 1 damage.', self, 'any', 'any', ['forceElusive']);

        // If no target was selected, refund the hero power
        if (!target) {
            return game.constants.refund;
        }

        // Deal 1 damage to the target
        game.attack(1, target);
        return true;
    },

    test(plr, self) {
        // The opponent should have 30 health.
        assert.equal(plr.getOpponent().getHealth(), 30);

        plr.inputQueue = ['face', 'y'];
        self.activate('cast');

        // The opponent should have 29 health.
        assert.equal(plr.getOpponent().getHealth(), 30 - 1);
    },
};


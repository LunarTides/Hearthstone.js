// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Priest Starting Hero',
    displayName: 'Anduin Wrynn',
    text: 'Priest starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Restore 2 Health.',
    hpCost: 2,
    classes: ['Priest'],
    rarity: 'Free',
    uncollectible: true,
    id: 8,

    heropower(plr, self) {
        // Restore 2 Health.

        // Hero power targets need to use the `forceElusive` flag.
        const target = game.interact.selectTarget('Restore 2 health.', self, 'any', 'any', ['forceElusive']);

        // If no target was selected, refund the hero power
        if (!target) {
            return game.constants.refund;
        }

        // Restore 2 health to the target
        target.addHealth(2, true);
        return true;
    },

    test(plr, self) {
        // Health: 1->3
        plr.health = 1;
        plr.inputQueue = ['face', 'n'];
        self.activate('heropower');

        assert.equal(plr.health, 1 + 2);

        // Health: 29->30 (cap at 30)
        plr.health = 29;
        plr.inputQueue = ['face', 'n'];
        self.activate('heropower');

        assert.equal(plr.health, 30);
    },
};

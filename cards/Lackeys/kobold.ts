// Created by Hand (before the Card Creator Existed)

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Kobold Lackey',
    stats: [1, 1],
    text: '<b>Battlecry:</b> Deal 2 damage.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 27,

    battlecry(plr, self) {
        // Deal 2 damage.

        // Select a target
        const target = game.interact.selectTarget('Deal 2 damage.', self, 'any', 'any');

        // If no target was selected, refund
        if (!target) {
            return game.constants.refund;
        }

        // Deal 2 damage to the target
        game.attack(2, target);
        return true;
    },

    test(plr, self) {
        plr.inputQueue = ['face', 'y'];
        self.activate('battlecry');

        assert.equal(plr.getOpponent().getHealth(), 30 - 2);
        assert.equal(plr.inputQueue, undefined);
    },
};

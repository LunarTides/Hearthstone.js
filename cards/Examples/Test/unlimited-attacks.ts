// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Unlimited Attacks Test',
    text: '<i>Can attack any number of times.</i>',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 141,

    attack: 1,
    health: 1,
    tribe: 'None',

    create(plr, self) {
        // Can attack any number of times.

        // This keyword can be added to weapons as well.
        self.addKeyword('Unlimited Attacks');
    },

    test(plr, self) {
        plr.summon(self);

        self.ready();
        self.resetAttackTimes();

        // The card should be not be sleepy
        assert.ok(!self.sleepy);

        game.attack(self, plr.getOpponent());

        // The card should still not be sleepy
        assert.ok(!self.sleepy);
    },
};


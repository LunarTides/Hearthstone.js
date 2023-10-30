// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Frozen Test',
    stats: [1, 1],
    text: 'This is forever <b>Frozen</b>',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 74,

    create(plr, self) {
        self.freeze();
    },

    passive(plr, self, key, _unknownValue, eventPlayer) {
        // This is forever Frozen

        if (key !== 'StartTurn') {
            return;
        }

        self.freeze();
    },

    test(plr, self) {
        // Summon this minion
        game.summonMinion(self, plr);

        for (let i = 0; i < 5; i++) {
            // Attacking the enemy hero this this minion should always return "frozen"
            const RETURN_VALUE = game.attack(self, plr.getOpponent());
            assert.equal(RETURN_VALUE, 'frozen');

            game.endTurn();
            game.endTurn();
        }
    },
};

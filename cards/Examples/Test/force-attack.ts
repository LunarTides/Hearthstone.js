// Created by the Custom Card Creator

import assert from 'node:assert';
import { type EventValue, type Blueprint } from '@Game/types.js';
import { Card } from '@Game/internal.js';

export const blueprint: Blueprint = {
    name: 'Force Attack Test',
    text: 'Whenever a minion attacks, it attacks again.',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 137,

    attack: 1,
    health: 1,
    tribe: 'None',

    create(plr, self) {
        // Store the attacker / target combo in storage.

        self.storage.attack = [];
    },

    passive(plr, self, key, _unknownValue, eventPlayer) {
        // Whenever a minion attacks, it attacks again.

        /*
         * If the turn ends, clear the storage.
         * This is so that you can attack with that combo next turn and it still works.
         */
        if (key === 'EndTurn') {
            self.storage.attack = [];
        }

        if (key !== 'Attack') {
            return;
        }

        const value = _unknownValue as EventValue<typeof key>;
        const [attacker, target] = value;

        /*
         * If the combo is the same, don't do anything
         * This is so that it doesn't get stuck in an infinite loop
         */
        if (game.lodash.isEqual(value, self.storage.attack)) {
            return;
        }

        // If it is not the same, clear the storage.
        self.storage.attack = [];

        if (!(attacker instanceof Card)) {
            return;
        }

        self.storage.attack = value;

        /*
         * Force attack. Note the `true` here.
         * We need to force it, since the card shouldn't be able to attack two times in a row
         */
        game.attack(attacker, target, true);
    },

    test(plr, self) {
        const opponent = plr.getOpponent();

        assert.equal(opponent.health, 30);
        plr.summon(self);

        game.attack(self, opponent, true);
        assert.equal(self.attack, 1);
        assert.equal(opponent.health, 28);
    },
};


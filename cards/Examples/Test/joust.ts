// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Joust Test',
    text: '<b>Battlecry:</b> Reveal a card from each player\'s deck. If yours costs more, gain +1/+1.',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 139,

    attack: 1,
    health: 1,
    tribe: 'None',

    battlecry(plr, self) {
        // Reveal a minion from each player's deck. If yours costs more, gain +1/+1.

        const win = plr.joust();

        if (!win) {
            return;
        }

        self.addStats(1, 1);
    },

    test(plr, self) {
        // TODO: Test #325
        assert(true);
    },
};


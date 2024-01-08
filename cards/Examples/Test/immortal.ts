// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Immortal Test',
    text: '<i>This minion cannot be removed from the battlefield.</i>',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 135,

    attack: 1,
    health: 1,
    tribe: 'None',

    remove(plr, self, key) {
        // This minion cannot be removed from the battlefield.

        // If you return false in the `remove` ability, the card will not be removed.

        /*
         * The key is the reason for removing the card.
         * It can currently only be "KillCard" or "SilenceCard"
         */
        if (key === 'KillCard') {
            return false;
        }

        if (key === 'SilenceCard') {
            return true;
        }

        return true;
    },

    test(plr, self) {
        // Summon this minion
        plr.summon(self);
        self.kill();

        assert(plr.getBoard().includes(self));
    },
};


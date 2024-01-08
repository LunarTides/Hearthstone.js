// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Disable Heropower Test',
    text: '<i>Disable your hero power.</i>',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 136,

    attack: 1,
    health: 2,
    tribe: 'None',

    tick(plr, self) {
        // Disable your hero power.

        plr.disableHeroPower = true;
    },

    remove(plr, self) {
        plr.disableHeroPower = false;
    },

    test(plr, self) {
        plr.mana = 10;

        // By default, you can use your hero power.
        assert(plr.canUseHeroPower());

        // When this card is on the board, you can't use your hero power.
        plr.summon(self);
        assert(!plr.canUseHeroPower());

        // When this card dies, you can use your hero power.
        self.kill();
        assert(plr.canUseHeroPower());
    },
};


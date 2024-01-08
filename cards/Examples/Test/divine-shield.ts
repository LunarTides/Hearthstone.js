// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Divine Shield Test',
    text: '<b>Divine Shield</b>',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 73,

    attack: 1,
    health: 1,
    tribe: 'None',

    create(plr, self) {
        self.addKeyword('Divine Shield');
    },

    test(plr, self) {
        // There should be no minions on the board
        assert.equal(plr.getBoard().length, 0);

        // There should be 1 minion on the board
        plr.summon(self);
        assert.equal(plr.getBoard().length, 1);

        // There should be 1 minion on the board since the divine shield saves it
        game.attack(9999, self);
        assert.equal(plr.getBoard().length, 1);

        // There should be no minions on the board since the divine shield is gone
        game.attack(9999, self);
        assert.equal(plr.getBoard().length, 0);
    },
};

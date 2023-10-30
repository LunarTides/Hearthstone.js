// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Deathrattle Test',
    stats: [1, 2],
    text: '<b>Deathrattle:</b> Summon two 1/1 Sheep.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 72,

    deathrattle(plr, self) {
        // Summon two 1/1 Sheep.

        for (let i = 0; i < 2; i++) {
            // Create the sheep
            const SHEEP = game.createCard('Sheep', plr);

            // Summon the sheep
            game.summonMinion(SHEEP, plr);
        }
    },

    test(plr, self) {
        // There should be 0 minions on the board
        assert.equal(game.board[plr.id].length, 0);
        game.summonMinion(self, plr);

        // There should be 0 minions on the board
        assert.equal(game.board[plr.id].length, 1);

        game.attack(2, self);

        // There should be 2 minions on the board since the deathrattle should have triggered
        assert.equal(game.board[plr.id].length, 2);
    },
};

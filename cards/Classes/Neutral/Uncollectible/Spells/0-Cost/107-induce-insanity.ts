// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Induce Insanity card.

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Induce Insanity',
    text: 'Force each enemy minion to attack a random enemy minion.',
    cost: 0,
    type: 'Spell',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 107,

    spellSchool: 'None',

    cast(plr, self) {
        // Force each enemy minion to attack a random enemy minion.
        const board = plr.getOpponent().getBoard();

        for (const enemyMinion of board) {
            const targetMinion = game.lodash.sample(board);
            if (!targetMinion) {
                continue;
            }

            game.attack(enemyMinion, targetMinion);
        }
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Yogg-Saron Unleashed Induced Insanity',
    text: 'Force each enemy minion to attack a random enemy minion.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    displayName: 'Induce Insanity',
    id: 107,

    cast(plr, self) {
        // Force each enemy minion to attack a random enemy minion.
        for (const enemyMinion of game.board[plr.getOpponent().id]) {
            const targetMinion = game.lodash.sample(game.board[plr.getOpponent().id]);
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

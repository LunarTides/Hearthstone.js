// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Chaotic Tendril',
    stats: [1, 1],
    text: '<b>Battlecry:</b> Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Common',
    id: 110,

    battlecry(plr, self) {
        // Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.
        const pool = game.functions.card.getAll().filter(card => card.type === 'Spell' && card.cost === 1);
        const spell = game.lodash.sample(pool)?.imperfectCopy();
        if (spell) {
            spell.activate('cast');
        }

        // TODO: Improve your future Chaotic Tendrils
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

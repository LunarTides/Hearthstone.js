// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';
import { Card } from '../../../../../../src/core/card.js';

export const blueprint: Blueprint = {
    name: 'Yogg-Saron Hopes End',
    stats: [7, 5],
    text: '<b>Battlecry:</b> Cast a random spell for each spell you\'ve cast this game <i>(targets chosen randomly)</i>.',
    cost: 10,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Legendary',
    displayName: 'Yogg-Saron, Hope\'s End',
    id: 103,

    battlecry(plr, self) {
        // Cast a random spell for each spell you've cast this game (targets chosen randomly).
        const amount = game.events.events.PlayCard?.[plr.id].filter(object => object[0] instanceof Card && object[0].type === 'Spell').length;
        if (!amount) {
            return;
        }

        const pool = game.functions.card.getAll().filter(card => card.type === 'Spell');
        for (let i = 0; i < amount; i++) {
            const card = game.lodash.sample(pool)?.imperfectCopy();
            if (!card) {
                continue;
            }

            card.activate('cast');
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

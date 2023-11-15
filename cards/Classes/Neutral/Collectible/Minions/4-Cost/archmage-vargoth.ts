// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Target, type Blueprint, type EventValue } from '@Game/types.js';
import { Card } from '../../../../../../src/core/card.js';

export const blueprint: Blueprint = {
    name: 'Archmage Vargoth',
    stats: [2, 6],
    text: 'At the end of your turn, cast a spell you\'ve cast this turn <i>(targets are random)</i>.',
    cost: 4,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Legendary',
    id: 98,

    passive(plr, self, key, _unknownValue) {
        // At the end of your turn, cast a spell you've cast this turn (targets are random).

        // Only proceed if the correct event key was broadcast
        if (key !== 'EndTurn') {
            return;
        }

        const spells: Card[] | undefined = game.events.events.PlayCard?.[plr.id].filter(object => object[0] instanceof Card && object[0].type === 'Spell' && object[1] === game.turns).map(object => object[0] as Card);
        if (!spells || spells.length <= 0) {
            return;
        }

        const spell = game.lodash.sample(spells);

        plr.forceTarget = game.functions.util.getRandomTarget();
        spell?.activate('cast');
        plr.forceTarget = undefined;
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

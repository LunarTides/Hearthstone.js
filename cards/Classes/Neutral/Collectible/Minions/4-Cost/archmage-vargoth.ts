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
    id: 94,

    passive(plr, self, key, _unknownValue) {
        // At the end of your turn, cast a spell you've cast this turn (targets are random).

        // Only proceed if the correct event key was broadcast
        if (key !== 'EndTurn') {
            return;
        }

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const value = _unknownValue as EventValue<typeof key>;

        const spells: Card[] | undefined = game.events.events.PlayCard?.[plr.id].filter(object => object[0] instanceof Card && object[0].type === 'Spell' && object[1] === game.turns).map(object => object[0] as Card);
        if (!spells || spells.length <= 0) {
            return;
        }

        const spell = game.lodash.sample(spells);
        const targets: Target[] = [...game.board[0], ...game.board[1], plr, plr.getOpponent()];

        const target = game.lodash.sample(targets);
        if (!target) {
            throw new TypeError('Could not find a target to cast the spell on. This is an error since it means that one of the players / minions on the board is undefined.');
        }

        plr.forceTarget = target;
        spell?.activate('cast');
        plr.forceTarget = undefined;
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

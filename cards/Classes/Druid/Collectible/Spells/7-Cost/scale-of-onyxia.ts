// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Scale of Onyxia',
    text: 'Fill your board with 2/1 Whelps with <b>Rush</b>.',
    cost: 7,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Druid'],
    rarity: 'Common',
    id: 96,

    cast(plr, self) {
        // Fill your board with 2/1 Whelps with Rush.
        const remainingBoardSpace = game.functions.util.getRemainingBoardSpace(plr);
        for (let index = 0; index < remainingBoardSpace; index++) {
            const whelp = game.createCard('Onyxian Whelp', plr);
            game.summonMinion(whelp, plr);
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

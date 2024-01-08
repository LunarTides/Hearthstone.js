// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Scale of Onyxia',
    text: 'Fill your board with 2/1 Whelps with <b>Rush</b>.',
    cost: 7,
    type: 'Spell',
    classes: ['Druid'],
    rarity: 'Common',
    collectible: true,
    id: 100,

    spellSchool: 'None',

    cast(plr, self) {
        // Fill your board with 2/1 Whelps with Rush.
        const remainingBoardSpace = game.functions.util.getRemainingBoardSpace(plr);
        for (let index = 0; index < remainingBoardSpace; index++) {
            const whelp = game.newCard(game.cardIds.onyxianWhelp99, plr);
            plr.summon(whelp);
        }
    },

    test(plr, self) {
        assert.equal(plr.getBoard().length, 0);
        self.activate('cast');

        // Check if the board has been filled
        assert.equal(plr.getBoard().length, game.config.general.maxBoardSpace);

        // Check if every card on the board is a whelp
        assert.ok(plr.getBoard().every(card => card.id === game.cardIds.onyxianWhelp99));
    },
};

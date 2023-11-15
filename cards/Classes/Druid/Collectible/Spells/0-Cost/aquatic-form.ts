// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Aquatic Form',
    text: '<b>Dredge</b>. If you have the Mana to play the card this turn, draw it.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Druid'],
    rarity: 'Rare',
    id: 89,

    cast(plr, self) {
        // Dredge. If you have the Mana to play the card this turn, draw it.
        const card = game.interact.card.dredge();
        if (!card || plr.mana < card.cost) {
            return;
        }

        plr.drawCard();
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

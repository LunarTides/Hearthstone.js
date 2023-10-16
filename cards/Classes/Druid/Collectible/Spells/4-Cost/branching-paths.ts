// Created by the Vanilla Card Creator

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Branching Paths',
    text: '<b>Choose Twice -</b> Draw a card; Give your minions +1 Attack; Gain 6 Armor.',
    cost: 4,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Druid'],
    rarity: 'Epic',
    id: 82,

    cast(plr, self) {
        // Choose Twice - Draw a card; Give your minions  +1 Attack; Gain 6 Armor.
        const chosen = game.interact.chooseOne(2, 'Draw a card', 'Give your minions +1 Attack', 'Gain 6 Armor');

        for (const i of chosen) {
            if (i === 0) {
                // Draw a card
                plr.drawCard();
            } else if (i === 1) {
                // Give your minions +1 Attack
                for (const card of game.board[plr.id]) {
                    card.addAttack(1);
                }
            } else {
                // Gain 6 Armor
                plr.addArmor(6);
            }
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

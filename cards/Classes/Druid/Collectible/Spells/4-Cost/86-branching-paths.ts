// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Branching Paths',
    text: '<b>Choose Twice -</b> Draw a card; Give your minions +1 Attack; Gain 6 Armor.',
    cost: 4,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Druid'],
    rarity: 'Epic',
    id: 86,

    cast(plr, self) {
        // Choose Twice - Draw a card; Give your minions  +1 Attack; Gain 6 Armor.
        game.interact.chooseOne(2, ['Draw a card', () => {
            // Draw a card
            plr.drawCard();
        }], ['Give your minions +1 Attack', () => {
            // Give your minions +1 Attack
            for (const card of game.board[plr.id]) {
                if (card.attack) {
                    card.attack += 1;
                }
            }
        }], ['Gain 6 Armor', () => {
            // Gain 6 Armor
            plr.addArmor(6);
        }]);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

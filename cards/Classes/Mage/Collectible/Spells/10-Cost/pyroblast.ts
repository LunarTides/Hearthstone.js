// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Pyroblast',
    text: 'Deal $10 damage.',
    cost: 10,
    type: 'Spell',
    spellSchool: 'Fire',
    classes: ['Mage'],
    rarity: 'Epic',
    id: 101,

    cast(plr, self) {
        // Deal $10 damage.
        const target = game.interact.selectTarget(self.text, self, 'any', 'any');
        if (!target) {
            return game.constants.refund;
        }

        // TODO: This doesn't work with spelldamage. +2 spell damage = 30 damage, for some reason
        game.attack(10, target);
        return true;
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

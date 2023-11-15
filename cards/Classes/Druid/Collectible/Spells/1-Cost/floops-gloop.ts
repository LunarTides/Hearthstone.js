// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Floops Gloop',
    displayName: 'Floop\'s Glorious Gloop',
    text: 'Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.',
    cost: 1,
    type: 'Spell',
    spellSchool: 'Nature',
    classes: ['Druid'],
    rarity: 'Legendary',
    id: 101,

    cast(plr, self) {
        // Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.
        const destroy = game.functions.event.addListener('KillMinion', () => {
            // Gain 1 Mana Crystal
            plr.refreshMana(1, plr.maxMana);

            return true;
        }, -1);

        game.functions.event.addListener('EndTurn', destroy);
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

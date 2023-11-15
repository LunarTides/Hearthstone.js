// Created by Hand (before the Card Creator Existed)

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    // Look in `titan.ts` first.
    name: 'Titan Example Ability 1',
    displayName: 'Ability 1',
    text: 'Destroy an enemy minion.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 79,

    cast(plr, self) {
        // Destroy an enemy minion.

        // Select an enemy minion to destroy
        const target = game.interact.selectCardTarget(self.text, self, 'enemy');
        if (!target) {
            return game.constants.refund;
        }

        target.kill();
        return true;
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};


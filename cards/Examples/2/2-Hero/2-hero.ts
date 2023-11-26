// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Hero Example',
    text: '<b>Battlecry:</b> Restore your hero to full health.',
    cost: 1,
    type: 'Hero',
    classes: ['Neutral'],
    rarity: 'Free',

    // The id of the hero power card.
    // The hero power card can be any spell. Here we use the 2-heropower.ts card.
    heropowerId: 130,

    uncollectible: true,
    id: 37,

    battlecry(plr, self) {
        // Restore your hero to full health.

        // Heal this card's owner to full health.
        // The `addHealth` method automatically caps the health of the player, so you don't need to worry.
        plr.addHealth(plr.maxHealth);
    },

    test(plr, self) {
        // Test battlecry
        plr.health = 1;
        self.activate('battlecry');
        assert.equal(plr.health, plr.maxHealth);
    },
};

// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Yogg-Saron Unleashed Tentacle Swarm',
    text: 'Fill your hand with 1/1 Chaotic Tendrils.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    displayName: 'Tentacle Swarm',
    id: 109,

    cast(plr, self) {
        // Fill your hand with 1/1 Chaotic Tendrils.
        const remaining = game.functions.util.getRemainingHandSize(plr);

        for (let index = 0; index < remaining; index++) {
            const card = game.createCard('Chaotic Tendril', plr);
            plr.addToHand(card);
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

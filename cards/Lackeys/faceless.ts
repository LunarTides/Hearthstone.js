// Created by Hand (before the Card Creator Existed)

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Faceless Lackey',
    stats: [1, 1],
    text: '<b>Battlecry:</b> Summon a random 2-Cost minion.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 25,

    battlecry(plr, self) {
        // Summon a random 2-Cost minion.

        // filter out all cards that aren't 2-cost minions
        const minions = game.functions.card.getAll().filter(card => card.type === 'Minion' && card.cost === 2);

        // Choose a random minion
        const rand = game.lodash.sample(minions);
        if (!rand) {
            return;
        }

        // Summon the minion
        const minion = game.createCard(rand.name, plr);
        game.summonMinion(minion, plr);
    },

    test(plr, self) {
        // If there doesn't exist any 2-Cost minions, pass the test
        if (!game.functions.card.getAll().some(card => card.cost === 2 && card.type === 'Minion')) {
            return;
        }

        const exists2CostMinion = () => game.board[plr.id].some(card => card.cost === 2);

        // There shouldn't exist any 2-Cost minions right now.
        assert(!exists2CostMinion());
        self.activate('battlecry');

        // There should exist a 2-Cost minion now.
        assert(exists2CostMinion());
    },
};

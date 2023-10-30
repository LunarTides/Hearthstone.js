// Created by Hand (before the Card Creator Existed)

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Goblin Lackey',
    stats: [1, 1],
    text: '<b>Battlecry:</b> Give a friendly minion +1 Attack and <b>Rush</b>.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 26,

    battlecry(plr, self) {
        // Give a friendly minion +1 Attack and Rush.

        // Prompt the user to select a friendly minion
        const TARGET = game.interact.selectCardTarget('Give a friendly minion +1 Attack and Rush', self, 'friendly');

        // If no target was selected, refund
        if (!TARGET) {
            return game.constants.REFUND;
        }

        // Add +1 Attack
        TARGET.addStats(1, 0);

        // Add Rush
        TARGET.addKeyword('Rush');
        return true;
    },

    test(plr, self) {
        // Summon a sheep
        const SHEEP = game.createCard('Sheep', plr);
        game.summonMinion(SHEEP, plr);

        // Activate the battlecry, choose the sheep
        plr.inputQueue = ['1'];
        self.activate('battlecry');

        // The sheep should have 2 attack and rush
        assert.equal(SHEEP.getAttack(), 2);
        assert(SHEEP.hasKeyword('Rush'));
    },
};

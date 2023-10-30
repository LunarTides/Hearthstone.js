// Created by Hand (before the Card Creator Existed)

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Witchy Lackey',
    stats: [1, 1],
    text: '<b>Battlecry:</b> Transform a friendly minion into one that costs (1) more.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 28,

    battlecry(plr, self) {
        // Transform a friendly minion into one that costs (1) more.

        // Ask the user which minion to transform
        const TARGET = game.interact.selectCardTarget('Transform a friendly minion into one that costs (1) more.', self, 'friendly');

        // If no target was selected, refund
        if (!TARGET) {
            return game.constants.REFUND;
        }

        // There isn't any cards that cost more than 10, so refund
        if (TARGET.cost >= 10) {
            return game.constants.REFUND;
        }

        // Filter minions that cost (1) more than the target
        const MINIONS = game.functions.card.getAll().filter(card => card.type === 'Minion' && card.cost === TARGET.cost + 1);

        // Choose a random minion from the filtered list.
        const RANDOM = game.lodash.sample(MINIONS);
        if (!RANDOM) {
            return game.constants.REFUND;
        }

        // Create the card
        const MINION = game.createCard(RANDOM.name, plr);

        // Destroy the target and summon the new minion in order to get the illusion that the card was transformed
        TARGET.destroy();

        // Summon the card to the player's side of the board
        game.summonMinion(MINION, plr);
        return true;
    },

    test(plr, self) {
        const existsMinionWithCost = (cost: number) => game.board[plr.id].some(card => card.cost === cost);

        // Summon a sheep
        const SHEEP = game.createCard('Sheep', plr);
        game.summonMinion(SHEEP, plr);

        // There shouldn't exist a minion with 1 more cost than the sheep.
        assert(!existsMinionWithCost(SHEEP.cost + 1));

        // If there doesn't exist any 2-Cost minions, pass the test
        if (!game.functions.card.getAll().some(card => card.cost === SHEEP.cost + 1 && card.type === 'Minion')) {
            return;
        }

        // Activate the battlecry, select the sheep.
        plr.inputQueue = ['1'];
        self.activate('battlecry');

        // There should now exist a minion with 1 more cost than the sheep.
        assert(existsMinionWithCost(SHEEP.cost + 1));
    },
};

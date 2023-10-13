// Created by the Custom Card Creator

import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Galakrond The Unspeakable',
    displayName: 'Galakrond, the Unspeakable',
    text: '<b>Battlecry:</b> Destroy {amount} random enemy minion{plural}.',
    cost: 7,
    type: 'Hero',
    classes: ['Priest'],
    rarity: 'Legendary',
    hpText: 'Add a random Priest minion to your hand.',
    hpCost: 2,
    id: 70,

    battlecry(plr, self) {
        // Destroy 1 random enemy minion.
        const amount = game.functions.card.galakrondFormula(self.storage.invokeCount);

        for (let i = 0; i < amount; i++) {
            // Get a random minion from the opponent's board.
            const board = game.board[plr.getOpponent().id];

            const minion = game.lodash.sample(board);
            if (!minion) {
                continue;
            }

            // Kill it
            minion.kill();
        }
    },

    heropower(plr, self) {
        // Add a random Priest minion to your hand.
        const possibleCards = game.functions.card.getAll().filter(c => c.type === 'Minion' && game.functions.card.validateClasses(c.classes, 'Priest'));
        if (possibleCards.length <= 0) {
            return;
        }

        let card = game.lodash.sample(possibleCards);
        if (!card) {
            return;
        }

        card = game.createCard(card.name, plr);

        plr.addToHand(card);
    },

    invoke(plr, self) {
        game.functions.card.galakrondBump(self, 'invokeCount');
    },

    placeholders(plr, self) {
        if (!self.storage.invokeCount) {
            return {amount: 0, plural: 's', plural2: 'They'};
        }

        const amount = game.functions.card.galakrondFormula(self.storage.invokeCount);
        const multiple = amount > 1;
        const plural = multiple ? 's' : '';

        return {amount, plural};
    },
};

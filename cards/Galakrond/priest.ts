// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
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
        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);

        for (let i = 0; i < AMOUNT; i++) {
            // Get a random minion from the opponent's board.
            const BOARD = game.board[plr.getOpponent().id];

            const MINION = game.lodash.sample(BOARD);
            if (!MINION) {
                continue;
            }

            // Kill it
            MINION.kill();
        }
    },

    heropower(plr, self) {
        // Add a random Priest minion to your hand.
        const POSSIBLE_CARDS = game.functions.card.getAll().filter(c => c.type === 'Minion' && game.functions.card.validateClasses(c.classes, 'Priest'));
        if (POSSIBLE_CARDS.length <= 0) {
            return;
        }

        let card = game.lodash.sample(POSSIBLE_CARDS);
        if (!card) {
            return;
        }

        card = game.createCard(card.name, plr);

        plr.addToHand(card);
    },

    invoke(plr, self) {
        self.galakrondBump('invokeCount');
    },

    placeholders(plr, self) {
        if (!self.storage.invokeCount) {
            return { amount: 0, plural: 's', plural2: 'They' };
        }

        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);
        const MULTIPLE = AMOUNT > 1;
        const PLURAL = MULTIPLE ? 's' : '';

        return { amount: AMOUNT, plural: PLURAL };
    },
};

// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';
import { type Card } from '../../src/core/card.js';

export const BLUEPRINT: Blueprint = {
    name: 'Galakrond the Wretched',
    displayName: 'Galakrond, the Wretched',
    text: '<b>Battlecry:</b> Summon {amount} random Demon{plural}.',
    cost: 7,
    type: 'Hero',
    classes: ['Warlock'],
    rarity: 'Legendary',
    hpText: 'Summon two 1/1 Imps.',
    hpCost: 2,
    id: 71,

    battlecry(plr, self) {
        // Summon 1 random Demon.
        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);

        const testDemoness = (card: Card) => game.functions.card.matchTribe(card.tribe!, 'Demon');

        for (let i = 0; i < AMOUNT; i++) {
            // Find all demons
            const POSSIBLE_CARDS = game.functions.card.getAll().filter(c => c.type === 'Minion' && testDemoness(c));

            // Choose a random one
            let card = game.lodash.sample(POSSIBLE_CARDS);
            if (!card) {
                break;
            }

            // Summon it
            card = game.createCard(card.name, plr);
            game.summonMinion(card, plr);
        }
    },

    heropower(plr, self) {
        // Summon two 1/1 Imps.
        for (let i = 0; i < 2; i++) {
            const CARD = game.createCard('Draconic Imp', plr);
            if (!CARD) {
                break;
            }

            game.summonMinion(CARD, plr);
        }
    },

    invoke(plr, self) {
        self.galakrondBump('invokeCount');
    },

    placeholders(plr, self) {
        if (!self.storage.invokeCount) {
            return { amount: 0, plural: 's', plural2: 'They' };
        }

        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);
        const MULTILPE = AMOUNT > 1;
        const PLURAL = MULTILPE ? 's' : '';

        return { amount: AMOUNT, plural: PLURAL };
    },
};

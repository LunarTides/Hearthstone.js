// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';
import { Card } from '../../src/core/card.js';

export const BLUEPRINT: Blueprint = {
    name: 'Galakrond the Nightmare',
    displayName: 'Galakrond, the Nightmare',
    text: '<b>Battlecry:</b> Draw {amount} card{plural}. {plural2} costs (0).',
    cost: 7,
    type: 'Hero',
    classes: ['Rogue'],
    rarity: 'Legendary',
    hpText: 'Add a <b>Lackey</b> to your hand.',
    hpCost: 2,
    id: 67,

    battlecry(plr, self) {
        // Draw {amount} cards. They cost (0).

        // Get the amount of cards to draw
        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);

        for (let i = 0; i < AMOUNT; i++) {
            const CARD = plr.drawCard();
            if (!(CARD instanceof Card)) {
                return;
            }

            // Set the cost to 0
            CARD.addEnchantment('cost = 0', self);
        }
    },

    heropower(plr, self) {
        // Add a lacky to your hand.
        const LACKEY_NAMES = ['Ethereal Lackey', 'Faceless Lackey', 'Goblin Lackey', 'Kobold Lackey', 'Witchy Lackey'];

        const LACKEY_NAME = game.lodash.sample(LACKEY_NAMES);
        if (!LACKEY_NAME) {
            return;
        }

        const LACKEY = game.createCard(LACKEY_NAME, plr);

        plr.addToHand(LACKEY);
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
        const PLURAL2 = MULTIPLE ? 'They' : 'It';

        return { amount: AMOUNT, plural: PLURAL, plural2: PLURAL2 };
    },
};

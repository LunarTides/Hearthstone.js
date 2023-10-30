// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';
import { Card } from '../../src/core/card.js';

export const BLUEPRINT: Blueprint = {
    name: 'Galakrond the Unbreakable',
    displayName: 'Galakrond, the Unbreakable',
    text: '<b>Battlecry:</b> Draw {amount} minion{plural}. Give {plural2} +4/+4.',
    cost: 7,
    type: 'Hero',
    classes: ['Warrior'],
    rarity: 'Legendary',
    hpText: 'Give your hero +3 Attack this turn.',
    hpCost: 2,
    id: 69,

    battlecry(plr, self) {
        // Draw 1 minion. Give them +4/+4.
        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);

        // Draw the minions
        for (let i = 0; i < AMOUNT; i++) {
            const CARD = plr.drawCard();
            if (!(CARD instanceof Card)) {
                continue;
            }

            // Give it +4/+4
            CARD.addStats(4, 4);
        }
    },

    heropower(plr, self) {
        // Give your hero +3 Attack this turn.

        plr.attack += 3;
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
        const PLURAL2 = MULTIPLE ? 'them' : 'it';

        return { amount: AMOUNT, plural: PLURAL, plural2: PLURAL2 };
    },
};

// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Wildheart Guff',
    text: '<b>Battlecry:</b> Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.',
    cost: 5,
    type: 'Hero',
    heropowerId: 113,
    classes: ['Druid'],
    rarity: 'Legendary',
    id: 89,

    battlecry(plr, self) {
        // Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.
        plr.maxMana = 20;
        plr.addEmptyMana(1);
        plr.drawCard();
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

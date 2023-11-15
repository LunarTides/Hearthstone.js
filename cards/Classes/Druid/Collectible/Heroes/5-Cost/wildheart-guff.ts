// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Wildheart Guff',
    text: '<b>Battlecry:</b> Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.',
    cost: 5,
    type: 'Hero',
    hpText: '<b>Choose One -</b> Draw a card; or Gain an empty Mana Crystal.',
    hpCost: 2,
    classes: ['Druid'],
    rarity: 'Legendary',
    id: 89,

    battlecry(plr, self) {
        // Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.
        plr.maxMana = 20;
        plr.addEmptyMana(1);
        plr.drawCard();
    },

    heropower(plr, self) {
        // Choose One - Draw a card; or Gain an empty Mana Crystal.
        game.interact.chooseOne(1, ['Draw a card', () => {
            // Draw a card
            plr.drawCard();
        }], ['Gain an empty Mana Crystal', () => {
            // Gain an empty ManaCrystal
            plr.addEmptyMana(1);
        }]);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Nurture',
    text: '<b>Choose One -</b> Draw a card; or Gain an empty Mana Crystal.',
    cost: 2,
    type: 'Heropower',
    classes: ['Druid'],
    rarity: 'Free',
    collectible: false,
    id: 113,

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

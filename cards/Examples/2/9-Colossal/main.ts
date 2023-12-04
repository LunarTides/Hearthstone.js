// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Colossal Example',
    text: 'Colossal +2.',
    cost: 2,
    type: 'Minion',
    attack: 5,
    health: 3,
    tribe: 'Beast',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 45,

    create(plr, self) {
        // Put the names of the cards here. The 0 is this card.
        //
        // The board will look like this
        // Left Arm
        // Colossal Example
        // Right Arm
        self.addKeyword('Colossal', [43, 0, 44]);
    },

    test(plr, self) {
        // TODO: Test. #325
    },
};

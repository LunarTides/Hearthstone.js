// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Colossal Example',
    stats: [5, 3],
    text: 'Colossal +2.',
    cost: 2,
    type: 'Minion',
    tribe: 'Beast',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
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

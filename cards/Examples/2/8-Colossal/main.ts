// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
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
        // Put the names of the cards here. The "" is this card.
        //
        // The board will look like this (it uses their display names, if they have them):
        // Left Arm
        // Colossal Example
        // Right Arm
        self.addKeyword('Colossal', ['Colossal Example Left Arm', '', 'Colossal Example Right Arm']);
    },

    test(plr, self) {
        // TODO: Test. #325
    },
};

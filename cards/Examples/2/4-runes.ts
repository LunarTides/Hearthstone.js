// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Rune Example',
    stats: [1, 2],
    text: 'This is an example card to show how runes work.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 39,

    create(plr, self) {
        // You need 2 frost runes and 1 blood rune to use this card.
        self.runes = 'FFB';
    },

    test(plr, self) {
        // TODO: Test. #325
    },
};

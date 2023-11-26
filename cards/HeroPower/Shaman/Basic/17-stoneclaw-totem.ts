// Created by Hand (before the Card Creator Existed)

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Stoneclaw Totem',
    stats: [0, 2],
    text: '<b>Taunt</b>',
    cost: 1,
    type: 'Minion',
    tribe: 'Totem',
    classes: ['Shaman'],
    rarity: 'Free',
    uncollectible: true,
    id: 17,

    create(plr, self) {
        self.addKeyword('Taunt');
    },
};

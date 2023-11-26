// Created by Hand (before the Card Creator Existed)

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Windswept Elemental',
    text: '<b>Rush</b>',
    cost: 2,
    type: 'Minion',
    attack: 2,
    health: 1,
    tribe: 'Totem',
    classes: ['Shaman'],
    rarity: 'Free',
    uncollectible: true,
    id: 19,

    create(plr, self) {
        self.addKeyword('Rush');
    },
};

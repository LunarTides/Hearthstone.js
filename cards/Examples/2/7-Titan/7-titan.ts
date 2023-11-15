// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Titan Example',
    stats: [10, 10],
    text: '<b>Titan</b>.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 78,

    create(plr, self) {
        // Put the names of the titan ability cards, like in corrupt, but a list.
        self.addKeyword('Titan', ['Titan Example Ability 1', 'Titan Example Ability 2', 'Titan Example Ability 3']);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

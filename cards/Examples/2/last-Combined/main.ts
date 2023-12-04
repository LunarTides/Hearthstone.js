// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Combined Example 2',
    text: 'Colossal +2. Dormant. Corrupt.',
    cost: 0,
    type: 'Minion',
    attack: 5,
    health: 3,
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Legendary',
    collectible: false,
    id: 48,

    create(plr, self) {
        self.runes = 'BBB';

        self.addKeyword('Colossal', [46, 0, 47]);
        self.addKeyword('Corrupt', 49);

        // The summoned minions get Dormant automatically if the main minion has dormant.
        self.addKeyword('Dormant', 2);
    },
};

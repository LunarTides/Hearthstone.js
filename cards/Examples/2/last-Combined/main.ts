// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Combined Example 2',
    stats: [5, 3],
    text: 'Colossal +2. Dormant. Corrupt.',
    cost: 0,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Legendary',
    uncollectible: true,
    id: 48,

    create(plr, self) {
        self.runes = 'BBB';

        self.addKeyword('Colossal', ['Combined Example 2 Left Arm', '', 'Combined Example 2 Right Arm']);
        self.addKeyword('Corrupt', 'Combined Example 2 Corrupted');

        // The summoned minions get Dormant automatically if the main minion has dormant.
        self.addKeyword('Dormant', 2);
    },
};

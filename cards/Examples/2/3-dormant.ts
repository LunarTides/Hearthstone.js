// Created by Hand

import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Dormant Example',
    stats: [8, 8],
    text: '<b>Dormant</b> for 2 turns. <b>Battlecry:</b> Dredge.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 38,

    create(plr, self) {
        // The 2 is how many turns this minion should be dormant for.
        // Full disclosure: The dormant system is one of the most untested parts of this game.
        // If you find any bugs, please open an issue.
        self.addKeyword('Dormant', 2);
    },

    // The battlecry only triggers when the minion is no longer dormant.
    battlecry(plr, self) {
        // Dredge.

        game.interact.card.dredge();
    },

    test(plr, self) {
        // TODO: Test. #325
    },
};

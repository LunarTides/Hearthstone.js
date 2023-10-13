// Created by Hand

import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'DIY 1',
    stats: [1, 1],
    text: '<b>This is a DIY card, it does not work by default. Battlecry:</b> Give this minion +1/+1.',
    cost: 0,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 61,

    battlecry(plr, self) {
        // Give this minion +1/+1.

        // Try to give this minion +1/+1 yourself.

        // DON'T CHANGE ANYTHING BELOW THIS LINE

        // Testing your solution.
        game.interact.verifyDiySolution(self.getAttack() === 2 && self.getHealth() === 2, '1.ts');
    },
};

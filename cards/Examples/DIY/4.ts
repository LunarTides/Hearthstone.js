
// Created by Hand

import { type Blueprint, type EventValue } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'DIY 4',
    stats: [0, 10],
    text: '<b>This is a DIY card, it does not work by default.</b> Whenever a friendly minion dies, Resurrect it with 1/1 stats.',
    cost: 0,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 64,

    passive(plr, self, key, _unknownValue, eventPlayer) {
        // Whenever a minion dies, Resurrect it with 1/1 stats.

        // If the key is for a different event, stop the function.
        if (!(key === 'KillMinion')) {
            return;
        }

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const VALUE = _unknownValue as EventValue<typeof key>;

        // Don't change this line
        if (VALUE.plr !== plr) {
            return;
        }

        // Try to:
        // 1. Resurrect the minion (val) with 1/1 stats.

        // THIS ONLY GETS VALIDATED ONCE A MINION DIES. PLEASE TRY TO CAUSE A MINION TO DIE IN ORDER TO VALIDATE YOUR SOLUTION

        // DON'T CHANGE ANYTHING BELOW THIS LINE
        // Also there are some spoilers about the solution in the verification process down below
        // so if you don't want to see it, don't scroll down

        // Testing your solution.
        if (self.storage.solved) {
            return true;
        }

        const SOLVED = game.board[plr.id].some(card => (
            card.id === VALUE.id
                && card.type === VALUE.type
                && card.getAttack() === 1
                && card.getHealth() === 1
                && card.uuid !== VALUE.uuid
                && card.plr === plr
        ));

        game.interact.verifyDiySolution(SOLVED, self);
        if (!SOLVED) {
            self.kill();
        }

        self.storage.solved = true;
        return true;
    },
};

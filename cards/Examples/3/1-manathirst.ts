// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Manathirst Example',
    stats: [1, 2],
    text: '<b>Battlecry:</b> Freeze an enemy minion. Manathirst (6): Silence it first.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 50,

    battlecry(plr, self) {
        const returnValue = self.manathirst(6);

        // Make the prompt.
        const prompt = returnValue ? 'Silence then freeze an enemy minion.' : 'Freeze an enemy minion.';

        // Select a target to freeze (and silence)
        // The first argument is the prompt to ask the user.
        // The second argument is this card (aka `self`).
        // The third argument is the alignment of the target the user is restricted to. If this is "enemy", the user can only select enemy targets, if this is "friendly", the user can only select friendly targets, if this is "any", the user can select any target.
        //
        // Ask the user to select a target based on the `prompt`, the user can only select enemy minions
        const target = game.interact.selectCardTarget(prompt, self, 'enemy');

        // If target is false it means that the user cancelled their selection. Return `game.constants.REFUND` to refund the card.
        if (!target) {
            return game.constants.refund;
        }

        // If the manathirst was successful, silence the target first
        if (returnValue) {
            target.silence();
        }

        // Freeze the target
        target.freeze();

        // Return true since otherwise, typescript will complain about the function not returning a value in all branches
        return true;
    },

    // This is optional, you will learn more about it in the `condition` example in `3-3`.
    condition(plr, self) {
        return self.manathirst(6);
    },

    test(plr, self) {
        const sheep = game.createCard(1, plr.getOpponent());
        sheep.addStats(4, 4);
        game.summonMinion(sheep, plr.getOpponent());

        assert.equal(sheep.getAttack(), 5);
        assert.equal(sheep.getHealth(), 5);
        assert(!sheep.hasKeyword('Frozen'));

        plr.emptyMana = 1;
        assert.equal(plr.emptyMana, 1);
        plr.inputQueue = ['1'];
        self.activate('battlecry');

        assert(sheep.hasKeyword('Frozen'));
        sheep.remKeyword('Frozen');
        assert(!sheep.hasKeyword('Frozen'));

        plr.emptyMana = 6;
        plr.inputQueue = ['1'];
        self.activate('battlecry');

        assert(sheep.hasKeyword('Frozen'));
        assert.equal(sheep.getAttack(), 1);
        assert.equal(sheep.getHealth(), 1);
    },
};

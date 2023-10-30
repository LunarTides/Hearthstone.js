// Created by Hand

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Inf Mana',
    text: 'Fill up your mana. For the rest of the game, your mana never decreases.',
    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 66,

    cast(plr, self) {
        // Fill up your mana. For the rest of the game, your mana never decreases.

        // Gain max mana every tick.
        // This lasts for the rest of the game, since we don't unhook it.
        game.functions.event.hookToTick(() => {
            plr.addMana(plr.maxMana);
        });
    },

    test(plr, self) {
        plr.mana = 5;
        self.activate('cast');

        // The game hasn't ticked yet
        assert.equal(plr.mana, 5);

        // Manually tick the game
        game.events.tick('GameLoop', undefined, plr);

        assert.equal(plr.mana, 10);

        // Play a card to verify that the mana doesn't decrease
        const CARD = game.createCard('Sheep', plr);
        const RESULT = game.playCard(CARD, plr);

        assert.equal(RESULT, true);
        assert.equal(plr.mana, 10);
    },
};

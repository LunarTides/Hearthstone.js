// Created by the Vanilla Card Creator

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Invigorate',
    text: '<b>Choose One -</b> Gain an empty Mana Crystal; or Draw a card.',
    cost: 2,
    type: 'Spell',
    spellSchool: 'Nature',
    classes: ['Druid'],
    rarity: 'Rare',
    id: 88,

    cast(plr, self) {
        // Choose One - Gain an empty Mana Crystal; or Draw a card.
        const chosen = game.interact.chooseOne(1, 'Gain an empty ManaCrystal', 'Draw a card')[0];

        if (chosen === 0) {
            // Gain an empty ManaCrystal
            plr.gainEmptyMana(1);
        } else {
            // Draw a card
            plr.drawCard();
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

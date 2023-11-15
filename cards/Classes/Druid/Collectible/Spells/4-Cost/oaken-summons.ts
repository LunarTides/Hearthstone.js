// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Oaken Summons',
    text: 'Gain 6 Armor. <b>Recruit</b> a minion that costs (4) or less.',
    cost: 4,
    type: 'Spell',
    spellSchool: 'Nature',
    classes: ['Druid'],
    rarity: 'Common',
    id: 83,

    cast(plr, self) {
        // Gain 6 Armor. Recruit a minion that costs (4) or less.
        plr.addArmor(6);

        const list = plr.deck.filter(card => card.cost <= 4);
        plr.recruit(list);
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

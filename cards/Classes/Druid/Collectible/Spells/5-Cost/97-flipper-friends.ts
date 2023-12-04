// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Flipper Friends',
    text: '<b>Choose One</b> - Summon a 6/6 Orca with <b>Taunt</b>; or six 1/1 Otters with <b>Rush</b>.',
    cost: 5,
    type: 'Spell',
    classes: ['Druid'],
    rarity: 'Common',
    collectible: true,
    id: 97,

    spellSchool: 'Nature',

    cast(plr, self) {
        // Choose One - Summon a 6/6 Orca with Taunt; or six 1/1 Otters with Rush.
        game.interact.chooseOne(1, ['Summon a 6/6 Orca with <b>Taunt</b>', () => {
            // Summon a 6/6 Orca with Taunt
            const orca = game.createCard(96, plr);
            game.summonMinion(orca, plr);
        }], ['Summon six 1/1 Otters with <b>Rush</b>', () => {
            // Summon six 1/1 Otters with Rush
            for (let index = 0; index < 6; index++) {
                const otter = game.createCard(95, plr);
                game.summonMinion(otter, plr);
            }
        }]);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

// Created by the Vanilla Card Creator

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Poison Seeds',
    text: 'Destroy all minions and summon 2/2 Treants to replace them.',
    cost: 4,
    type: 'Spell',
    spellSchool: 'Nature',
    classes: ['Druid'],
    rarity: 'Common',
    id: 78,

    cast(plr, self) {
        // Destroy all minions and summon 2/2 Treants to replace them.
        for (const [id, side] of game.board.entries()) {
            const player = game.functions.util.getPlayerFromId(id);

            for (const card of side) {
                card.kill();

                const treant = game.createCard('Poison Seeds Treant', player);
                game.summonMinion(treant, player);
            }
        }
    },

    test(plr, self) {
        // Unit testing
        assert(false);
    },
};

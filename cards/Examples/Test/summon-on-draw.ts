// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Summon On Draw Test',
    text: '<b>Summon on Draw. Colossal +2.</b>',
    cost: 1,
    type: 'Minion',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 133,

    attack: 1,
    health: 1,
    tribe: 'None',

    create(plr, self) {
        self.addKeyword('Summon On Draw');

        // Use the preexisting colossal example minions
        self.addKeyword('Colossal', [game.cardIds.leftArm46, game.cardIds.null0, game.cardIds.rightArm47]);
    },

    test(plr, self) {
        assert(false);
    },
};

// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Dew Process',
    text: 'For the rest of the game, players draw an extra card at the start of their turn.',
    cost: 2,
    type: 'Spell',
    classes: ['Druid'],
    rarity: 'Rare',
    collectible: true,
    id: 91,

    spellSchool: 'Nature',

    cast(plr, self) {
        // For the rest of the game, players draw an extra card at the start of their turn.
        game.functions.event.addListener('StartTurn', (_unknownValue, eventPlayer) => {
            eventPlayer.drawCard();
            return true;
        }, -1);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

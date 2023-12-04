// Created by Hand

import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Simple Card Reference Example',
    text: 'The Coin: {coin}',
    cost: 1,
    type: 'Minion',
    attack: 1,
    health: 1,
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 131,

    placeholders(plr, self) {
        // You can reference entire cards in placeholders.
        // Go in-game, give yourself this card, and type 'detail' to see how it works.
        return { coin: game.createCard(2, plr) };
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};

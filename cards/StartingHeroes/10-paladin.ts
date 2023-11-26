// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Uther Lightbringer',
    text: 'Paladin starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Summon a 1/1 Silver Hand Recruit',
    hpCost: 2,
    classes: ['Paladin'],
    rarity: 'Free',
    uncollectible: true,
    id: 10,

    heropower(plr, self) {
        // Summon a 1/1 Silver Hand Recruit.

        // Create the Silver Hand Recruit card.
        const card = game.createCard(20, plr);

        // Summon the card
        game.summonMinion(card, plr);
    },

    test(plr, self) {
        const checkIfMinionExists = () => game.board[plr.id].some(card => card.id === 20);

        // The minion should not exist
        assert(!checkIfMinionExists());
        self.activate('heropower');

        // The minion should now exist
        assert(checkIfMinionExists());
    },
};
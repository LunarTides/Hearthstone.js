// Created by the Custom Card Creator

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Death Knight Frail Ghoul',
    displayName: 'Frail Ghoul',
    stats: [1, 1],
    text: '<b>Charge</b> At the end of your turn, this minion dies.',
    cost: 1,
    type: 'Minion',
    tribe: 'Undead',
    classes: ['Death Knight'],
    rarity: 'Free',
    uncollectible: true,
    id: 23,

    create(plr, self) {
        self.addKeyword('Charge');
    },

    passive(plr, self, key, value, eventPlayer) {
        // At the end of your turn, this minion dies.

        // Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
        if (!(key === 'EndTurn' && eventPlayer === plr)) {
            return;
        }

        // Kill this minion
        self.kill();
    },

    test(plr, self) {
        const checkIfThisCardIsOnTheBoard = () => game.board[plr.id].some(card => card.uuid === self.uuid);

        // Summon the minion, the minion should now be on the board
        game.summonMinion(self, plr);
        assert(checkIfThisCardIsOnTheBoard());

        // Broadcast a dummy event, the minion should still be on the board
        game.events.broadcastDummy(plr);
        assert(checkIfThisCardIsOnTheBoard());

        // End the player's turn, the minion should no longer be on the board
        game.endTurn();
        assert(!checkIfThisCardIsOnTheBoard());
    },
};
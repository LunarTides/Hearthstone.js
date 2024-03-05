// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Poison Seeds',
    text: 'Destroy all minions and summon 2/2 Treants to replace them.',
    cost: 4,
    type: 'Spell',
    classes: ['Druid'],
    rarity: 'Common',
    collectible: true,
    id: 82,

    spellSchool: 'Nature',

    cast(plr, self) {
        // Destroy all minions and summon 2/2 Treants to replace them.
        for (const player of [game.player1, game.player2]) {
            for (const card of player.board) {
                card.kill();

                const treant = game.newCard(game.cardIds.treant83, player);
                player.summon(treant);
            }
        }
    },

    test(plr, self) {
        const amountOfCards = 3;

        // Summon n Sheep
        for (let i = 0; i < amountOfCards; i++) {
            const sheep = game.newCard(game.cardIds.sheep1, plr);
            plr.summon(sheep);
        }

        // Replace with Treants
        self.activate('cast');

        // Check if every card is a Treant
        const board = plr.board;

        assert.equal(board.length, amountOfCards);
        assert.ok(board.every(card => card.id === game.cardIds.treant83));
    },
};

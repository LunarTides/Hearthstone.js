// Created by Hand (before the Card Creator Existed)

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
	name: 'Healing Totem',
	stats: [0, 2],
	// TODO: What does this hashtag mean? This was pulled from the vanilla card
	text: 'At the end of your turn, restore #1 Health to all friendly minions.',
	cost: 1,
	type: 'Minion',
	tribe: 'Totem',
	classes: ['Shaman'],
	rarity: 'Free',
	uncollectible: true,
	id: 15,

	passive(plr, self, key, value, eventPlayer) {
		// At the end of your turn, restore 1 Health to all friendly minions.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (!(key === 'EndTurn' && eventPlayer === plr)) {
			return;
		}

		// Restore 1 Health to all friendly minions
		for (const minion of game.board[plr.id]) {
			minion.addHealth(1, true);
		}
	},

	test(plr, self) {
		// Summon 5 Sheep with 2 max health.
		for (let i = 0; i < 5; i++) {
			const card = game.createCard('Sheep', plr);
			card.maxHealth = 2;
			game.summonMinion(card, plr);
		}

		const checkSheepHealth = (expected: number) => game.board[plr.id].filter(card => card.name === 'Sheep').every(card => card.getHealth() === expected && card.getAttack() === 1);

		// Summon this minion. All sheep should have 1 health.
		game.summonMinion(self, plr);
		assert(checkSheepHealth(1));

		// Broadcast a dummy event. All sheep should still have 1 health.
		game.events.broadcastDummy(plr);
		assert(checkSheepHealth(1));

		// End the player's turn. All sheep should now have 2 health.
		game.endTurn();
		assert(checkSheepHealth(2));

		// End the player's turn again. All sheep should still have 2 health since it is their max health.
		// We end the turn twice since we also end the opponent's turn.
		game.endTurn();
		game.endTurn();
		assert(checkSheepHealth(2));
	},
};

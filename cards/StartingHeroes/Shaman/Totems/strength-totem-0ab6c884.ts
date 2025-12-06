// Created by Hand (before the Card Creator Existed)

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	Event,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Strength Totem",
	text: "At the end of your turn, give another friendly minion +1 Attack.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Totem],
	id: "0ab6c884-d9c1-4cb1-8d7f-b531c448f725",

	attack: 0,
	health: 2,
	tribes: [Tribe.Totem],

	async passive(self, owner, key, value, eventPlayer) {
		// At the end of your turn, give another friendly minion +1 Attack.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (!game.event.is(key, value, Event.EndTurn) || eventPlayer !== owner) {
			return;
		}

		// The list that to choose from. Remove this minion from the list
		const board = owner.board.filter((card) => card.type === Type.Minion);
		game.functions.util.remove(board, self);

		// Choose the random minion
		const minion = game.lodash.sample(board);
		if (!minion) {
			return;
		}

		// Give that minion +1 Attack
		await minion.addStats(1, 0);
	},

	async test(self, owner) {
		// Summon 5 Sheep with 2 max health.
		for (let i = 0; i < 5; i++) {
			const card = await Card.create(
				game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
				owner,
			);
			await owner.summon(card);
		}

		const checkSheepAttack = (shouldBeMore: boolean) =>
			owner.board
				.filter(
					(card) =>
						card.id === game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
				)
				.some(
					(card) =>
						card.health === 1 &&
						((shouldBeMore && card.attack && card.attack > 1) ||
							(!shouldBeMore && card.attack === 1)),
				);

		// Summon this minion. All sheep should have 1 attack.
		await owner.summon(self);
		assert(checkSheepAttack(false));

		// Broadcast a dummy event. All sheep should still have 1 attack.
		await game.event.broadcastDummy(owner);
		assert(checkSheepAttack(false));

		// Check this 50 times
		for (let i = 0; i < 50; i++) {
			// Reset the players faigue to 0 to prevent them from dying
			owner.fatigue = 0;
			owner.getOpponent().fatigue = 0;

			await game.endTurn();

			// At least 1 sheep should have more than 1 attack.
			assert(checkSheepAttack(true));
			// This card should not get more attack.
			assert.equal(self.attack, self.blueprint.attack);

			await game.endTurn();
		}
	},
};

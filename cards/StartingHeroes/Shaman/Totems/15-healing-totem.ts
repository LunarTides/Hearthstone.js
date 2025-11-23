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
	name: "Healing Totem",
	text: "At the end of your turn, restore 1 Health to all friendly minions.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Totem],
	id: 15,

	attack: 0,
	health: 2,
	tribes: [Tribe.Totem],

	async passive(self, owner, key, value, eventPlayer) {
		// At the end of your turn, restore 1 Health to all friendly minions.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (!game.event.is(key, value, Event.EndTurn) || eventPlayer !== owner) {
			return;
		}

		// Restore 1 Health to all friendly minions
		for (const card of owner.board.filter(
			(card) => card.type === Type.Minion,
		)) {
			await card.addHealth(1, true);
		}
	},

	async test(self, owner) {
		// Summon 5 Sheep with 2 max health.
		for (let i = 0; i < 5; i++) {
			const card = await Card.create(game.cardIds.sheep_1, owner);
			card.maxHealth = 2;
			await owner.summon(card);
		}

		const checkSheepHealth = (expected: number) =>
			owner.board
				.filter((card) => card.id === 1)
				.every((card) => card.health === expected && card.attack === 1);

		// Summon this minion. All sheep should have 1 health.
		await owner.summon(self);
		assert(checkSheepHealth(1));

		// Broadcast a dummy event. All sheep should still have 1 health.
		await game.event.broadcastDummy(owner);
		assert(checkSheepHealth(1));

		// End the player's turn. All sheep should now have 2 health.
		await game.endTurn();
		assert(checkSheepHealth(2));

		/*
		 * End the player's turn again. All sheep should still have 2 health since it is their max health.
		 * We end the turn twice since we also end the opponent's turn.
		 */
		await game.endTurn();
		await game.endTurn();
		assert(checkSheepHealth(2));
	},
};

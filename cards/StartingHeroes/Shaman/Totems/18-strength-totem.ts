// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Strength Totem",
	text: "At the end of your turn, give another friendly minion +1 Attack.",
	cost: 1,
	type: "Minion",
	classes: ["Shaman"],
	rarity: "Free",
	collectible: false,
	id: 18,

	attack: 0,
	health: 2,
	tribe: "Totem",

	async passive(owner, self, key, value, eventPlayer) {
		// At the end of your turn, give another friendly minion +1 Attack.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (key !== "EndTurn" || eventPlayer !== owner) {
			return;
		}

		// The list that to choose from. Remove this minion from the list
		const board = owner.board.filter((card) => card.type === "Minion");
		game.functions.util.remove(board, self);

		// Choose the random minion
		const minion = game.lodash.sample(board);
		if (!minion) {
			return;
		}

		// Give that minion +1 Attack
		await minion.addStats(1, 0);
	},

	async test(owner, self) {
		// Summon 5 Sheep with 2 max health.
		for (let i = 0; i < 5; i++) {
			const card = await Card.create(game.cardIds.sheep1, owner);
			await owner.summon(card);
		}

		const checkSheepAttack = (shouldBeMore: boolean) =>
			owner.board
				.filter((card) => card.id === 1)
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

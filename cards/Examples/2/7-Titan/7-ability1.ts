// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	// Look in `titan.ts` first.
	name: "Ability 1",
	text: "Destroy an enemy minion.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 79,

	spellSchool: "None",

	async cast(owner, self) {
		// Destroy an enemy minion.

		// Select an enemy minion to destroy
		const target = await game.interact.selectCardTarget(self.text, self, "enemy");
		if (!target) {
			return Card.REFUND;
		}

		await target.kill();
		return true;
	},

	async test(owner, self) {
		const opponent = owner.getOpponent();

		// Create a sheep and summon it on the opponent's side of the board
		const sheep = await Card.create(game.cardIds.sheep1, opponent);
		await opponent.summon(sheep);

		// Kill the sheep
		owner.inputQueue = ["1"];
		await self.activate("cast");

		// Check if the sheep is dead
		assert.equal(owner.board.length, 0);
		assert.equal(sheep.health, 0);
	},
};

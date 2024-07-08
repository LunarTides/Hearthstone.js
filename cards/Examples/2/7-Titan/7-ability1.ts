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

	cast(owner, self) {
		// Destroy an enemy minion.

		// Select an enemy minion to destroy
		const target = game.interact.selectCardTarget(self.text, self, "enemy");
		if (!target) {
			return game.constants.refund;
		}

		target.kill();
		return true;
	},

	test(owner, self) {
		const opponent = owner.getOpponent();

		// Create a sheep and summon it on the opponent's side of the board
		const sheep = new Card(game.cardIds.sheep1, opponent);
		opponent.summon(sheep);

		// Kill the sheep
		owner.inputQueue = ["1"];
		self.activate("cast");

		// Check if the sheep is dead
		assert.equal(owner.board.length, 0);
		assert.equal(sheep.health, 0);
	},
};

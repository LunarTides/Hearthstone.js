// Created by Hand

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Fireblast",
	text: "Deal 1 damage.",
	cost: 2,
	type: "Heropower",
	classes: ["Mage"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 114,

	async heropower(owner, self) {
		// Deal 1 damage.

		// Use of `promptTarget` in the `heropower` ability requires the use of the `forceElusive` flag
		const target = await game.functions.interact.promptTarget(
			"Deal 1 damage.",
			self,
			"any",
			"any",
			["forceElusive"],
		);

		// If no target was selected, refund the hero power
		if (!target) {
			return Card.REFUND;
		}

		// Deal 1 damage to the target
		await game.attack(1, target);
		return true;
	},

	async test(owner, self) {
		// The opponent should have 30 health.
		assert.equal(owner.getOpponent().health, 30);

		owner.inputQueue = ["face", "y"];
		await self.activate("heropower");

		// The opponent should have 29 health.
		assert.equal(owner.getOpponent().health, 30 - 1);
	},
};

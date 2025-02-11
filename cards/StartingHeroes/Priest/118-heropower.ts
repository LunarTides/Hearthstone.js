// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Lesser Heal",
	text: "Restore 2 Health.",
	cost: 2,
	type: "Heropower",
	classes: ["Priest"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 118,

	async heropower(owner, self) {
		// Restore 2 Health.

		// Hero power targets need to use the `forceElusive` flag.
		const target = await game.functions.interact.prompt.target(
			"Restore 2 health.",
			self,
			"any",
			"any",
			["forceElusive"],
		);

		// If no target was selected, refund the hero power
		if (!target) {
			return Card.REFUND;
		}

		// Restore 2 health to the target
		await target.addHealth(2, true);
		return true;
	},

	async test(owner, self) {
		// Health: 1->3
		owner.health = 1;
		owner.inputQueue = ["face", "n"];
		await self.activate("heropower");

		assert.equal(owner.health, 1 + 2);

		// Health: 29->30 (cap at 30)
		owner.health = 29;
		owner.inputQueue = ["face", "n"];
		await self.activate("heropower");

		assert.equal(owner.health, 30);
	},
};

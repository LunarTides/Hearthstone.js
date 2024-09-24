// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Heropower Example",
	text: "Restore 2 Health to your hero.",
	cost: 2,

	// Remember to set the type to "Heropower"
	type: "Heropower",

	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 130,

	// This gets triggered when the player uses their hero power.
	async heropower(owner, self) {
		// Restore 2 Health to your hero.

		owner.addHealth(2);
	},

	async test(owner, self) {
		// Test hero power
		owner.health = 1;
		await self.activate("heropower");
		assert.equal(owner.health, 1 + 2);
	},
};

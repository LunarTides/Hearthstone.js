// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Life Tap",
	text: "Draw a card and take 2 damage.",
	cost: 2,
	type: "Heropower",
	classes: ["Warlock"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 121,

	async heropower(owner, self) {
		// Draw a card and take 2 damage.

		// Deal 2 damage to the player.
		await game.attack(2, owner);
		await owner.drawCards(1);
	},

	async test(owner, self) {
		// Clear the player's hand
		owner.hand = [];

		// The player should have no cards in their hand, and should have 30 health
		assert.equal(owner.hand.length, 0);
		assert.equal(owner.health, 30);

		await self.activate("heropower");

		// The player should now have 1 card in their hand, and 28 health.
		assert.equal(owner.hand.length, 1);
		assert.equal(owner.health, 30 - 2);
	},
};

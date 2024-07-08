// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

// This is the first card in this stage. The next card in this stage is the `2-Hero` folder.

export const blueprint: Blueprint = {
	// This is the blueprint format for a location card.
	name: "Location Example",
	text: "Restore 2 Health to your hero.",
	cost: 1,
	type: "Location",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 36,

	// This is the amount of times you can trigger the location card before it breaking.
	durability: 3,

	/*
	 * How many turns you have to wait until you can use the location card again.
	 * Afaik, in hearthstone, this is always 2.
	 */
	cooldown: 2,

	/*
	 * Remember to use the correct ability
	 * For spells, the ability is `cast`.
	 * And for location cards, the ability is `use`.
	 */
	use(owner, self) {
		// Restore 2 Health to your hero.

		owner.addHealth(2);
	},

	test(owner, self) {
		owner.health = 1;
		self.activate("use");

		assert.equal(owner.health, 1 + 2);
	},
};

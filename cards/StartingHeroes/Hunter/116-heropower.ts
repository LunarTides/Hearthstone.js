// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Steady Shot",
	text: "Deal 2 damage to the enemy hero.",
	cost: 2,
	type: "Heropower",
	classes: ["Hunter"],
	rarity: "Free",
	collectible: false,
	id: 116,

	heropower(owner, self) {
		// Deal 2 damage to the enemy hero.
		game.attack(2, owner.getOpponent());
	},

	test(owner, self) {
		// The opponent should have 30 health
		assert.equal(owner.getOpponent().health, 30);
		self.activate("heropower");

		// The opponent should now have 28 health.
		assert.equal(owner.getOpponent().health, 30 - 2);
	},
};

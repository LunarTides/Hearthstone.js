// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Lesser Heal",
	text: "Restore 2 Health.",
	cost: 2,
	type: "Heropower",
	classes: ["Priest"],
	rarity: "Free",
	collectible: false,
	id: 118,

	heropower(owner, self) {
		// Restore 2 Health.

		// Hero power targets need to use the `forceElusive` flag.
		const target = game.interact.selectTarget(
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
		target.addHealth(2, true);
		return true;
	},

	test(owner, self) {
		// Health: 1->3
		owner.health = 1;
		owner.inputQueue = ["face", "n"];
		self.activate("heropower");

		assert.equal(owner.health, 1 + 2);

		// Health: 29->30 (cap at 30)
		owner.health = 29;
		owner.inputQueue = ["face", "n"];
		self.activate("heropower");

		assert.equal(owner.health, 30);
	},
};

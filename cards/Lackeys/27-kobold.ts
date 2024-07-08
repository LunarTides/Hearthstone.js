// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Kobold Lackey",
	text: "<b>Battlecry:</b> Deal 2 damage.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 27,

	attack: 1,
	health: 1,
	tribe: "None",

	battlecry(owner, self) {
		// Deal 2 damage.

		// Select a target
		const target = game.interact.selectTarget(
			"Deal 2 damage.",
			self,
			"any",
			"any",
		);

		// If no target was selected, refund
		if (!target) {
			return Card.REFUND;
		}

		// Deal 2 damage to the target
		game.attack(2, target);
		return true;
	},

	test(owner, self) {
		owner.inputQueue = ["face", "y"];
		self.activate("battlecry");

		assert.equal(owner.getOpponent().health, 30 - 2);
		assert.equal(owner.inputQueue, undefined);
	},
};

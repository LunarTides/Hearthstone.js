// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Unlimited Attacks Test",
	text: "<i>Can attack any number of times.</i>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 141,

	attack: 1,
	health: 1,
	tribe: "None",

	async create(owner, self) {
		// Can attack any number of times.

		// This keyword can be added to weapons as well.
		self.addKeyword("Unlimited Attacks");
	},

	async test(owner, self) {
		await owner.summon(self);

		self.ready();
		self.resetAttackTimes();

		// The card should be not be sleepy
		assert.ok(!self.sleepy);

		await game.attack(self, owner.getOpponent());

		// The card should still not be sleepy
		assert.ok(!self.sleepy);
	},
};

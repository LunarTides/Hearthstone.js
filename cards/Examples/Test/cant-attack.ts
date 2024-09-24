// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Cant Attack Test",
	text: "<b>Cant Attack.</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 134,

	attack: 1,
	health: 1,
	tribe: "None",

	async create(owner, self) {
		// Cant Attack

		self.addKeyword("Cant Attack");
	},

	async test(owner, self) {
		await owner.summon(self);

		// The card should be sleepy by default
		assert.ok(self.sleepy);

		await game.endTurn();
		await game.endTurn();

		// But the card should still be sleepy on the next turn
		assert.ok(self.sleepy);
	},
};

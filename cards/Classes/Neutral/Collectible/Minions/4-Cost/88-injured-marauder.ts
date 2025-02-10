// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Injured Marauder",
	text: "<b>Taunt. Battlecry:</b> Deal 6 damage to this minion.",
	cost: 4,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Common",
	collectible: true,
	tags: [],
	id: 88,

	attack: 5,
	health: 10,
	tribe: "None",

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword("Taunt");
	},

	async battlecry(owner, self) {
		// Taunt Battlecry: Deal 6 damage to this minion.
		await game.attack(6, self);
	},

	async test(owner, self) {
		await self.activate("battlecry");
		assert.equal(self.health, 4);
	},
};

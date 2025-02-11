// Created by the Vanilla Card Creator

// This is the Flipper Friends Orca card

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Orca",
	text: "<b>Taunt</b>",
	cost: 6,
	type: "Minion",
	classes: ["Druid"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 96,

	attack: 6,
	health: 6,
	tribe: "Beast",

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword("Taunt");
	},
};

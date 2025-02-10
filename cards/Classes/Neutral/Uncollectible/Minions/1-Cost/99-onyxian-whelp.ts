// Created by the Vanilla Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Onyxian Whelp",
	text: "<b>Rush</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 99,

	attack: 2,
	health: 1,
	tribe: "Dragon",

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword("Rush");
	},
};

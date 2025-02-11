// Created by Hand (before the Card Creator Existed)

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Stoneclaw Totem",
	text: "<b>Taunt</b>",
	cost: 1,
	type: "Minion",
	classes: ["Shaman"],
	rarity: "Free",
	collectible: false,
	tags: ["totem"],
	id: 17,

	attack: 0,
	health: 2,
	tribe: "Totem",

	async create(owner, self) {
		self.addKeyword("Taunt");
	},
};

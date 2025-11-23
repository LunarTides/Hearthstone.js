// Created by the Vanilla Card Creator

// This is the Flipper Friends Orca card

import {
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Orca",
	text: "<b>Taunt</b>",
	cost: 6,
	type: Type.Minion,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 96,

	attack: 6,
	health: 6,
	tribes: [Tribe.Beast],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Taunt);
	},
};

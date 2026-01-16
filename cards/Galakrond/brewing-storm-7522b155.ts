// Created by the Vanilla Card Creator

import {
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Brewing Storm",
	text: "<b>Rush</b>",
	cost: 2,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-7009-b00f-7522b1557a9f",

	attack: 2,
	health: 2,
	tribes: [Tribe.Elemental],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

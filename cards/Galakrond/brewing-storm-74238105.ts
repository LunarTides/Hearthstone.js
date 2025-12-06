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
	id: "74238105-ff8b-415e-a5d4-eda223e080ce",

	attack: 2,
	health: 2,
	tribes: [Tribe.Elemental],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

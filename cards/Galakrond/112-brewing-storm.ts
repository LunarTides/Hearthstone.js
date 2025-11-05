// Created by the Vanilla Card Creator

import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
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
	id: 112,

	attack: 2,
	health: 2,
	tribes: [MinionTribe.Elemental],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

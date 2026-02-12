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
	name: "Onyxian Whelp",
	text: "<b>Rush</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f82-701a-a865-b6b98e79c765",

	attack: 2,
	health: 1,
	tribes: [Tribe.Dragon],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

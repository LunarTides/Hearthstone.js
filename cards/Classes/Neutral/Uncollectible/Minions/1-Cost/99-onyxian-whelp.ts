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
	name: "Onyxian Whelp",
	text: "<b>Rush</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 99,

	attack: 2,
	health: 1,
	tribes: [MinionTribe.Dragon],

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

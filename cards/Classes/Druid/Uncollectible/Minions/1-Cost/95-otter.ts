// Created by the Vanilla Card Creator

// This is the Flipper Friends Otter card

import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Otter",
	text: "<b>Rush</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 95,

	attack: 1,
	health: 1,
	tribe: MinionTribe.Beast,

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword(Keyword.Rush);
	},
};

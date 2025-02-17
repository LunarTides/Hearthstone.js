// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Windswept Elemental",
	text: "<b>Rush</b>",
	cost: 2,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 19,

	attack: 2,
	health: 1,
	tribes: [MinionTribe.Totem],

	async create(owner, self) {
		self.addKeyword(Keyword.Rush);
	},
};

// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

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
	tribes: [Tribe.Totem],

	async create(self, owner) {
		self.addKeyword(Keyword.Rush);
	},
};

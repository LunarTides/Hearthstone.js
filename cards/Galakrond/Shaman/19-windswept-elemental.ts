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
	id: "e63b1490-7fb2-4edf-9a24-82742e32bbf4",

	attack: 2,
	health: 1,
	tribes: [Tribe.Totem],

	async create(self, owner) {
		self.addKeyword(Keyword.Rush);
	},
};

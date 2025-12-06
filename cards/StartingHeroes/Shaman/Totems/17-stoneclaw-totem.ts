// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Stoneclaw Totem",
	text: "<b>Taunt</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Totem],
	id: "23a3f866-3db8-4ae5-baa1-bca4d3ad4d98",

	attack: 0,
	health: 2,
	tribes: [Tribe.Totem],

	async create(self, owner) {
		self.addKeyword(Keyword.Taunt);
	},
};

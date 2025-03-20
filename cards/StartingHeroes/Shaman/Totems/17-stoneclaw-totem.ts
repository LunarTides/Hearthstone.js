// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	CardTag,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
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
	tags: [CardTag.Totem],
	id: 17,

	attack: 0,
	health: 2,
	tribes: [MinionTribe.Totem],

	async create(owner, self) {
		self.addKeyword(Keyword.Taunt);
	},
};

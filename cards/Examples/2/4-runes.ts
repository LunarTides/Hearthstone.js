// Created by Hand

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Rune Example",
	text: "This is an example card to show how runes work.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 39,

	attack: 1,
	health: 2,
	tribe: MinionTribe.None,

	async create(owner, self) {
		// You need 2 frost runes and 1 blood rune to use this card.
		self.runes = "FFB";
	},

	async test(owner, self) {
		// TODO: Test. #325
	},
};

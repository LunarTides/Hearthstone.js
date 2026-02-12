// Created by Hand

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Rune,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Rune Example",
	text: "This is an example card to show how runes work.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-7029-bba5-ff3c29ecef49",

	attack: 1,
	health: 2,
	tribes: [Tribe.None],

	async create(self, owner) {
		// You need 2 frost runes and 1 blood rune to use this card.
		self.runes = [Rune.Frost, Rune.Frost, Rune.Blood];
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

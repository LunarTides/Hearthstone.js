// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Forge Example",
	text: "<b>Forge:</b> Gain +1/+1.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 75,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Put the id of the forged counterpart, like in corrupt.
		self.addKeyword(Keyword.Forge, game.cardIds.forgedExample_76);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

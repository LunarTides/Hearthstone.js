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
	id: "a40c7cfd-8e84-41b6-b234-3d79f6423e75",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Put the id of the forged counterpart, like in corrupt.
		self.addKeyword(
			Keyword.Forge,
			game.cardIds.forgedExample_30449537_f8fb_4dc7_9056_ffa98d2c3f75,
		);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

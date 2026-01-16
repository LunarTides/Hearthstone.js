// Created by Hand

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
	name: "Corrupt Example",
	text: "<b>Corrupt.</b>",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-702a-a6ec-297a6382f69b",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		/*
		 * Put the id of the corrupted counterpart here. This is the id of 5-corrupted.ts
		 * Corrupted is another system that is very untested and might get a rewrite.
		 */
		self.addKeyword(
			Keyword.Corrupt,
			game.cardIds.corruptedExample_019bc665_4f80_702b_9638_5a8b8e46ef3a,
		);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

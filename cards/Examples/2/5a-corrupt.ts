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
	id: "a5d296af-549a-4d7f-8c3e-ac0ed842dd64",

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
			game.cardIds.corruptedExample_ba8de33e_a8fd_426e_9ac0_08f5a3c949bc,
		);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

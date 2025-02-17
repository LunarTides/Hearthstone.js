// Created by Hand

import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Corrupt Example",
	text: "<b>Corrupt.</b>",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 40,

	attack: 1,
	health: 1,
	tribe: MinionTribe.None,

	async create(owner, self) {
		/*
		 * Put the id of the corrupted counterpart here. This is the id of 5-corrupted.ts
		 * Corrupted is another system that is very untested and might get a rewrite.
		 */
		self.addKeyword(Keyword.Corrupt, game.cardIds.corruptedExample41);
	},

	async test(owner, self) {
		// TODO: Test. #325
	},
};

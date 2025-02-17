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
	name: "Dormant Example",
	text: "<b>Dormant</b> for 2 turns. <b>Battlecry:</b> Dredge.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 38,

	attack: 8,
	health: 8,
	tribe: MinionTribe.None,

	async create(owner, self) {
		/*
		 * The 2 is how many turns this minion should be dormant for.
		 * Full disclosure: The dormant system is one of the most untested parts of this game.
		 * If you find any bugs, please open an issue.
		 */
		self.addKeyword(Keyword.Dormant, 2);
	},

	// The battlecry only triggers when the minion is no longer dormant.
	async battlecry(owner, self) {
		// Dredge.

		await game.functions.interact.prompt.dredge();
	},

	async test(owner, self) {
		// TODO: Test. #325
	},
};

// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Forgetful Test",
	text: "<i>50% Chance to attack the wrong enemy.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 138,

	attack: 5,
	health: 4,
	tribe: MinionTribe.None,

	async create(owner, self) {
		// Forgetful

		self.addKeyword(Keyword.Forgetful);
	},

	async test(owner, self) {
		// TODO: Test #325
		assert(true);

		// 1 await owner.summon(self);

		/*
		 * 2 const sheep = game.newCard(game.cardIds.sheep1, owner.getOpponent());
		 * 3 await owner.getOpponent().summon(sheep);
		 */

		/*
		 * 4 for (let i = 0; i < 10; i++) {
		 * 5     if (!sheep.isAlive()) {
		 * 6         break;
		 * 7     }
		 */

		/*
		 * 8   self.ready();
		 * 9   self.resetAttackTimes();
		 */

		/*
		 * 10    await game.attack(self, owner.getOpponent());
		 * 11 }
		 */

		// assert(!sheep.isAlive());
	},
};

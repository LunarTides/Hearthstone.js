// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Forgetful Test",
	text: "<i>50% Chance to attack the wrong enemy.</i>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 138,

	attack: 5,
	health: 4,
	tribe: "None",

	create(owner, self) {
		// Forgetful

		self.addKeyword("Forgetful");
	},

	test(owner, self) {
		// TODO: Test #325
		assert(true);

		// 1 owner.summon(self);

		/*
		 * 2 const sheep = game.newCard(game.cardIds.sheep1, owner.getOpponent());
		 * 3 owner.getOpponent().summon(sheep);
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
		 * 10    game.attack(self, owner.getOpponent());
		 * 11 }
		 */

		// assert(!sheep.isAlive());
	},
};

// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Frozen Test",
	text: "This is forever <b>Frozen</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 74,

	attack: 1,
	health: 1,
	tribe: "None",

	create(owner, self) {
		self.freeze();
	},

	passive(owner, self, key, _unknownValue, eventPlayer) {
		// This is forever Frozen

		if (key !== "StartTurn") {
			return;
		}

		self.freeze();
	},

	test(owner, self) {
		// Summon this minion
		owner.summon(self);

		for (let i = 0; i < 5; i++) {
			// Attacking the enemy hero this this minion should always return "frozen"
			const returnValue = game.attack(self, owner.getOpponent());
			assert.equal(returnValue, "frozen");

			game.endTurn();
			game.endTurn();
		}
	},
};

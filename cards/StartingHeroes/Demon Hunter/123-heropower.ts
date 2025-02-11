// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Demon Claws",
	text: "+1 Attack this turn.",
	cost: 1,
	type: "Heropower",
	classes: ["Demon Hunter"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 123,

	async heropower(owner, self) {
		// +1 Attack this turn.

		// Give the player +1 attack.
		await owner.addAttack(1);
	},

	async test(owner, self) {
		// The player should start with 0 attack
		assert.equal(owner.attack, 0);
		await self.activate("heropower");

		// The player should gain 1 attack
		assert.equal(owner.attack, 1);
	},
};

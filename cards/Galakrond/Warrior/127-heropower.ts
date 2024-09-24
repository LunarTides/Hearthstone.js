// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Might",
	text: "Give your hero +3 Attack this turn.",
	cost: 2,
	type: "Heropower",
	classes: ["Warrior"],
	rarity: "Legendary",
	collectible: false,
	id: 127,

	async heropower(owner, self) {
		// Give your hero +3 Attack this turn.

		owner.attack += 3;
	},

	async test(owner, self) {
		assert.equal(owner.attack, 0);
		await self.activate("heropower");

		assert.equal(owner.attack, 3);
	},
};

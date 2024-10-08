// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Armor Up",
	text: "Gain 2 Armor.",
	cost: 2,
	type: "Heropower",
	classes: ["Warrior"],
	rarity: "Free",
	collectible: false,
	id: 117,

	async heropower(owner, self) {
		// Gain 2 Armor.

		// Give the player +2 armor.
		owner.addArmor(2);
	},

	async test(owner, self) {
		// The player should have 0 armor
		assert.equal(owner.armor, 0);
		await self.activate("heropower");

		// The player should now have 2 armor
		assert.equal(owner.armor, 2);
	},
};

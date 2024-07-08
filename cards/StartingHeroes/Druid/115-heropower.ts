// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Shapeshift",
	text: "+1 Attack this turn. +1 Armor.",
	cost: 2,
	type: "Heropower",
	classes: ["Druid"],
	rarity: "Free",
	collectible: false,
	id: 115,

	heropower(owner, self) {
		// +1 Attack this turn. +1 Armor.

		// Give the player +1 attack.
		owner.addAttack(1);

		// Give the player +1 armor.
		owner.addArmor(1);
	},

	test(owner, self) {
		// The player should start with 0 attack
		assert.equal(owner.attack, 0);
		assert.equal(owner.armor, 0);
		self.activate("heropower");

		// The player should gain 1 attack
		assert.equal(owner.attack, 1);
		assert.equal(owner.armor, 1);
	},
};

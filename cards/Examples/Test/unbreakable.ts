// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Unbreakable Test",
	text: "<i>This weapon is unbreakable.</i>",
	cost: 1,
	type: "Weapon",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 140,

	attack: 2,
	health: 4,

	create(owner, self) {
		// Add additional fields here
		self.addKeyword("Unbreakable");
	},

	test(owner, self) {
		// Unit testing
		assert.equal(self.health, 4);
		owner.setWeapon(self);

		game.attack(owner, owner.getOpponent(), true);
		assert.equal(self.health, 4);
	},
};

// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "10 Mana",
	text: "Gain 10 Mana.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 65,

	spellSchool: "None",

	async cast(owner, self) {
		// Gain 10 Mana.
		owner.addMana(10);
	},

	async test(owner, self) {
		owner.mana = 5;
		await self.activate("cast");

		assert.equal(owner.mana, 10);
	},
};

// Created by Hand

import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "10 Mana",
	text: "Gain 10 Mana.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-700c-b159-4571a8aa01f0",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Gain 10 Mana.
		owner.addMana(10);
	},

	async test(self, owner) {
		owner.mana = 5;
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, 10);
	},
};

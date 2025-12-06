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
	id: "da3b96c7-4bf6-465c-ae62-a76460e586c6",

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

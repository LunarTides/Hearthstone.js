// Created by Hand

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "10 Mana",
	text: "Gain 10 Mana.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 65,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Gain 10 Mana.
		owner.addMana(10);
	},

	async test(owner, self) {
		owner.mana = 5;
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, 10);
	},
};

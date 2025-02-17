// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	// Look in `titan.ts` first.
	name: "Ability 2",
	text: "Heal 3 damage.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 80,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Heal 3 damage.

		owner.addHealth(3);
	},

	async test(owner, self) {
		owner.health = owner.maxHealth - 5;
		await self.activate(Ability.Cast);

		assert.equal(owner.health, owner.maxHealth - 2);
	},
};

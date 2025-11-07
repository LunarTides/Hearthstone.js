// Created by Hand (before the Card Creator Existed)

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

	async cast(self, owner) {
		// Heal 3 damage.

		owner.addHealth(3);
	},

	async test(self, owner) {
		owner.health = owner.maxHealth - 5;
		await self.trigger(Ability.Cast);

		assert.equal(owner.health, owner.maxHealth - 2);
	},
};

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
	name: "Ability 3",
	text: "Restore 2 mana.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 81,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Restore 2 mana.

		owner.refreshMana(2);
	},

	async test(self, owner) {
		owner.mana = 5;
		owner.emptyMana = 10;

		const { mana } = owner;
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, mana + 2);
	},
};

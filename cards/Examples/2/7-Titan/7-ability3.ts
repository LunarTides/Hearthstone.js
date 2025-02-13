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
	name: "Ability 3",
	text: "Restore 2 mana.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 81,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Restore 2 mana.

		owner.refreshMana(2);
	},

	async test(owner, self) {
		owner.mana = 5;
		owner.emptyMana = 10;

		const { mana } = owner;
		await self.activate(Ability.Cast);

		assert.equal(owner.mana, mana + 2);
	},
};

// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	// Look in `titan.ts` first.
	name: "Ability 3",
	text: "Restore 2 mana.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 81,

	spellSchool: "None",

	async cast(owner, self) {
		// Restore 2 mana.

		owner.refreshMana(2);
	},

	async test(owner, self) {
		owner.mana = 5;
		owner.emptyMana = 10;

		const { mana } = owner;
		await self.activate("cast");

		assert.equal(owner.mana, mana + 2);
	},
};

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
	name: "Spell Damage Example",

	/*
	 * Put a $ sign before the number to show spell damage in the description.
	 * It's like a mini-placeholder, which is something you will learn about in the next chapter.
	 * If you have debug mode enabled, do `/eval @Player.spellDamage = 5` in order to see it working.
	 * You can also set `self.spellDamage = 5` in a minion's create ability to passively provide spell damage to the friendly player.
	 */
	text: "Deal $3 damage to the enemy hero.",

	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 42,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Deal $3 damage to the enemy hero.

		// Set the `spellDamage` flag to the attack in order to deal spell damage correctly.
		await game.attack(3, owner.getOpponent(), { spellDamage: true });
	},

	async test(self, owner) {
		const oldHealth = owner.getOpponent().health;

		owner.spellDamage = 3;
		await self.trigger(Ability.Cast);

		assert.equal(
			owner.getOpponent().health,
			oldHealth - (3 + owner.spellDamage),
		);
	},
};

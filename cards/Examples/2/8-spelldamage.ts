// Created by Hand

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
	name: "Spell Damage Example",

	/*
	 * Put a $ sign before the number to show spell damage in the description.
	 * It's like a mini-placeholder, which is something you will learn about in the next chapter.
	 * If you have debug mode enabled, do `/eval game.player.spellDamage += 5` in order to see it working.
	 * You can also set `self.spellDamage = 5` in a minion's create ability.
	 */
	text: "Deal $3 damage to the enemy hero.",

	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 42,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Deal $3 damage to the enemy hero.

		/*
		 * Put the $ sign here to make the game apply spell damage correctly.
		 * Ideally you wouldn't need to do that and the game would figure it out, but I wasn't able to get it to work.
		 */
		await game.attack("$3", owner.getOpponent());
	},

	async test(owner, self) {
		const oldHealth = owner.getOpponent().health;

		owner.spellDamage = 3;
		await self.activate(Ability.Cast);

		assert.equal(
			owner.getOpponent().health,
			oldHealth - (3 + owner.spellDamage),
		);
	},
};

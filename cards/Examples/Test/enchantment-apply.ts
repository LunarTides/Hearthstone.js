// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Enchantment Apply Test",
	text: "Select a friendly minion. Give it +1 Attack and +2 Health.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 143,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Select a friendly minion. Give it +1 Attack and +2 Health.

		const target = await game.functions.interact.prompt.targetCard(
			"Give +1 Attack and +2 Health.",
			self,
			{ alignment: "friendly" },
		);

		// If no target was selected, refund the spell.
		if (!target) {
			return Card.REFUND;
		}

		// Give the enchantment.
		target.addEnchantment(game.cardIds.enchantmentTest142, self);
		return true;
	},

	async test(owner, self) {
		const target = game.functions.util.getRandomTargetRelative(
			false,
			false,
			true,
			false,
		);
		const originalTargetAttack = target?.attack;
		const originalTargetHealth = target?.health;

		assert.notEqual(originalTargetAttack, undefined);
		assert.notEqual(originalTargetHealth, undefined);

		assert.equal(target?.attack, originalTargetAttack);
		assert.equal(target?.health, originalTargetHealth);

		owner.forceTarget = target;
		await self.trigger(Ability.Cast);
		owner.forceTarget = undefined;

		assert.equal(target?.attack, originalTargetHealth! + 1);
		assert.equal(target?.health, originalTargetHealth! + 2);
	},
};

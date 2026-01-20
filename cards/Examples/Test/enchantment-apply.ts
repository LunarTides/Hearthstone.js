// Created by Hand

import { Card } from "@Game/card.ts";
import {
	Ability,
	Alignment,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Enchantment Apply Test",
	text: "Select a friendly minion. Give it +1 Attack and +2 Health.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-7011-81af-dde076586bb3",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Select a friendly minion. Give it +1 Attack and +2 Health.

		const target = await game.prompt.targetCard(
			"Give +1 Attack and +2 Health.",
			self,
			{ alignment: Alignment.Friendly },
		);

		// If no target was selected, refund the spell.
		if (!target) {
			return Card.REFUND;
		}

		// Give the enchantment.
		await target.addEnchantment(
			game.cardIds.enchantmentTest_019bc665_4f7f_7012_a8c3_818e01ca1c52,
			self,
		);
		return true;
	},

	async test(self, owner) {
		await game.summon(
			await Card.create(
				game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
				owner,
			),
			owner,
		);

		const target = game.functions.util.getRandomTargetRelative(
			false,
			false,
			true,
			false,
			(target) => target instanceof Card && target.type === Type.Minion,
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

		assert.equal(target?.attack, originalTargetAttack! + 1);
		assert.equal(target?.health, originalTargetHealth! + 2);
	},
};

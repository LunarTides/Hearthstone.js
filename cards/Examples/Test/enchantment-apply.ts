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

	async cast(self, owner) {
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
		await target.addEnchantment(game.cardIds.enchantmentTest_142, self);
		return true;
	},

	async test(self, owner) {
		await game.summon(await Card.create(game.cardIds.sheep_1, owner), owner);

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

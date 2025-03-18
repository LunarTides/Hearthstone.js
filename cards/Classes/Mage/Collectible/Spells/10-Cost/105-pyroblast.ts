// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	GameAttackFlags,
	Rarity,
	SpellSchool,
	TargetAlignment,
	TargetClass,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Pyroblast",
	text: "Deal $10 damage.",
	cost: 10,
	type: Type.Spell,
	classes: [Class.Mage],
	rarity: Rarity.Epic,
	collectible: true,
	tags: [],
	id: 105,

	spellSchools: [SpellSchool.Fire],

	async cast(owner, self) {
		// Deal $10 damage.
		const target = await game.functions.interact.prompt.target(
			self.text,
			self,
			TargetAlignment.Any,
			TargetClass.Any,
		);
		if (!target) {
			return Card.REFUND;
		}

		await game.attack(10, target, [GameAttackFlags.SpellDamage]);
		return true;
	},

	async test(owner, self) {
		const enemyHealth = owner.getOpponent().health;
		owner.forceTarget = owner.getOpponent();

		// If no spellDamage
		await self.trigger(Ability.Cast);
		assert.equal(owner.getOpponent().health, enemyHealth - 10);

		// Reset health
		owner.getOpponent().health = enemyHealth;

		// If 5 spellDamage
		owner.spellDamage = 5;

		await self.trigger(Ability.Cast);
		assert.equal(owner.getOpponent().health, enemyHealth - 15);
	},
};

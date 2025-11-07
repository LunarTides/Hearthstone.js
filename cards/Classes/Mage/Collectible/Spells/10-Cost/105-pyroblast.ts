// Created by the Vanilla Card Creator

import { Card } from "@Game/card.ts";
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

	async cast(self, owner) {
		// Deal $10 damage.
		const target = await game.functions.interact.prompt.target(self.text, self);
		if (!target) {
			return Card.REFUND;
		}

		await game.attack(10, target, { spellDamage: true });
		return true;
	},

	async test(self, owner) {
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

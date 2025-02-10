// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Pyroblast",
	text: "Deal $10 damage.",
	cost: 10,
	type: "Spell",
	classes: ["Mage"],
	rarity: "Epic",
	collectible: true,
	id: 105,

	spellSchool: "Fire",

	async cast(owner, self) {
		// Deal $10 damage.
		const target = await game.functions.interact.promptTarget(
			self.text,
			self,
			"any",
			"any",
		);
		if (!target) {
			return Card.REFUND;
		}

		await game.attack("$10", target);
		return true;
	},

	async test(owner, self) {
		const enemyHealth = owner.getOpponent().health;
		owner.forceTarget = owner.getOpponent();

		// If no spellDamage
		await self.activate("cast");
		assert.equal(owner.getOpponent().health, enemyHealth - 10);

		// Reset health
		owner.getOpponent().health = enemyHealth;

		// If 5 spellDamage
		owner.spellDamage = 5;

		await self.activate("cast");
		assert.equal(owner.getOpponent().health, enemyHealth - 15);
	},
};

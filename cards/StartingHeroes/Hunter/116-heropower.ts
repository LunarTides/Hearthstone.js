// Created by the Custom Card Creator

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Steady Shot",
	text: "Deal 2 damage to the enemy hero.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Hunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 116,

	async heropower(owner, self) {
		// Deal 2 damage to the enemy hero.
		await game.attack(2, owner.getOpponent());
	},

	async test(owner, self) {
		// The opponent should have 30 health
		assert.equal(owner.getOpponent().health, owner.maxHealth);

		// The opponent should now have 28 health.
		await self.trigger(Ability.HeroPower);
		assert.equal(owner.getOpponent().health, owner.maxHealth - 2);

		// The opponent should now have 26 health.
		await self.trigger(Ability.HeroPower);
		assert.equal(owner.getOpponent().health, owner.maxHealth - 4);
	},
};

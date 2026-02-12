// Created by the Custom Card Creator

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Steady Shot",
	text: "Deal 2 damage to the enemy hero.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Hunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-7028-a3a3-8e79692d8c16",

	async heropower(self, owner) {
		// Deal 2 damage to the enemy hero.
		await game.attack(2, owner.getOpponent());
	},

	async test(self, owner) {
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

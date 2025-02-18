// Created by Hand

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Shapeshift",
	text: "+1 Attack this turn. +1 Armor.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 115,

	async heropower(owner, self) {
		// +1 Attack this turn. +1 Armor.

		// Give the player +1 attack.
		await owner.addAttack(1);

		// Give the player +1 armor.
		owner.addArmor(1);
	},

	async test(owner, self) {
		// The player should start with 0 attack
		assert.equal(owner.attack, 0);
		assert.equal(owner.armor, 0);
		await self.trigger(Ability.HeroPower);

		// The player should gain 1 attack
		assert.equal(owner.attack, 1);
		assert.equal(owner.armor, 1);
	},
};

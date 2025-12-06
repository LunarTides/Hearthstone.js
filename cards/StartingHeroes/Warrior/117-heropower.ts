// Created by the Custom Card Creator

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Armor Up",
	text: "Gain 2 Armor.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Warrior],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "ab216cd7-acda-432e-bde4-d3568846e6f2",

	async heropower(self, owner) {
		// Gain 2 Armor.

		// Give the player +2 armor.
		owner.addArmor(2);
	},

	async test(self, owner) {
		// The player should have 0 armor
		assert.equal(owner.armor, 0);
		await self.trigger(Ability.HeroPower);

		// The player should now have 2 armor
		assert.equal(owner.armor, 2);
	},
};

// Created by the Custom Card Creator

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Galakrond's Might",
	text: "Give your hero +3 Attack this turn.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Warrior],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "a62285a5-ae61-4e83-bea1-6340b17ff13e",

	async heropower(self, owner) {
		// Give your hero +3 Attack this turn.

		owner.attack += 3;
	},

	async test(self, owner) {
		assert.equal(owner.attack, 0);
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.attack, 3);
	},
};

// Created by the Custom Card Creator

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Demon Claws",
	text: "+1 Attack this turn.",
	cost: 1,
	type: Type.HeroPower,
	classes: [Class.DemonHunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 123,

	async heropower(self, owner) {
		// +1 Attack this turn.

		// Give the player +1 attack.
		await owner.addAttack(1);
	},

	async test(self, owner) {
		// The player should start with 0 attack
		assert.equal(owner.attack, 0);
		await self.trigger(Ability.HeroPower);

		// The player should gain 1 attack
		assert.equal(owner.attack, 1);

		// The player should gain 1 attack
		await self.trigger(Ability.HeroPower);
		assert.equal(owner.attack, 2);
	},
};

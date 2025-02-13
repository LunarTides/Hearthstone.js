// Created by the Custom Card Creator

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

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

	async heropower(owner, self) {
		// +1 Attack this turn.

		// Give the player +1 attack.
		await owner.addAttack(1);
	},

	async test(owner, self) {
		// The player should start with 0 attack
		assert.equal(owner.attack, 0);
		await self.activate(Ability.HeroPower);

		// The player should gain 1 attack
		assert.equal(owner.attack, 1);
	},
};

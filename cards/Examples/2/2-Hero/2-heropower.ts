// Created by Hand

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Heropower Example",
	text: "Restore 2 Health to your hero.",
	cost: 2,

	// Remember to set the type to `HeroPower`.
	type: Type.HeroPower,

	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 130,

	// This gets triggered when the player uses their hero power.
	async heropower(owner, self) {
		// Restore 2 Health to your hero.

		owner.addHealth(2);
	},

	async test(owner, self) {
		owner.health = 1;
		await self.trigger(Ability.HeroPower);
		assert.equal(owner.health, 1 + 2);
	},
};

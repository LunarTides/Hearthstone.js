// Created by Hand

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

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
	id: "019bc665-4f80-7026-b3ab-aa5a664f5024",

	// This gets triggered when the player uses their hero power.
	async heropower(self, owner) {
		// Restore 2 Health to your hero.

		owner.addHealth(2);
	},

	async test(self, owner) {
		owner.health = 1;
		await self.trigger(Ability.HeroPower);
		assert.equal(owner.health, 1 + 2);
	},
};

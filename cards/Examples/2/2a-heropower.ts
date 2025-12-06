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
	id: "d2ab1def-46dc-407f-8b82-ba347afb63ee",

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

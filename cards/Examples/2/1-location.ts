// Created by Hand

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Location Example",
	text: "Restore 2 Health to your hero.",
	cost: 1,

	// Remember to use the correct type.
	type: Type.Location,

	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "6afe94ae-588d-4ec0-b1bf-77dc6f1a5277",

	// This is the amount of times you can trigger the location card before it breaks.
	durability: 3,

	/*
	 * How many turns you have to wait until you can use the location card again.
	 * As far as I know, this is always 2 in Hearthstone.
	 */
	cooldown: 2,

	/*
	 * Remember to use the correct ability.
	 * For spells the ability is `cast`.
	 * For location cards, the ability is `use`.
	 */
	async use(self, owner) {
		// Restore 2 Health to your hero.

		owner.addHealth(2);
	},

	async test(self, owner) {
		owner.health = 1;
		await self.trigger(Ability.Use);

		assert.equal(owner.health, 1 + 2);
	},
};

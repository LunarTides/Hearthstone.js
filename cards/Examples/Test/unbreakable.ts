// Created by the Custom Card Creator

import { type Blueprint, Class, Keyword, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Unbreakable Test",
	text: "<i>This weapon is unbreakable.</i>",
	cost: 1,
	type: Type.Weapon,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "ce2c24be-7c75-4637-b046-14aefb34bb9e",

	attack: 2,
	health: 4,

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Unbreakable);
	},

	async test(self, owner) {
		// Unit testing
		assert.equal(self.health, 4);
		await owner.setWeapon(self);

		await game.attack(owner, owner.getOpponent(), { force: true });
		assert.equal(self.health, 4);
	},
};

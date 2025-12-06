// Created by the Vanilla Card Creator

import {
	Ability,
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Injured Marauder",
	text: "<b>Taunt. Battlecry:</b> Deal 6 damage to this minion.",
	cost: 4,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: "9860c1ae-fd86-4ebd-a202-dff7de6daf6b",

	attack: 5,
	health: 10,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Taunt);
	},

	async battlecry(self, owner) {
		// Taunt. Battlecry: Deal 6 damage to this minion.
		await game.attack(6, self);
	},

	async test(self, owner) {
		await self.trigger(Ability.Battlecry);
		assert.equal(self.health, 4);
	},
};

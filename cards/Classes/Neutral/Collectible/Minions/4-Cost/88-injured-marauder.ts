// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Injured Marauder",
	text: "<b>Taunt. Battlecry:</b> Deal 6 damage to this minion.",
	cost: 4,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: 88,

	attack: 5,
	health: 10,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword(Keyword.Taunt);
	},

	async battlecry(owner, self) {
		// Taunt Battlecry: Deal 6 damage to this minion.
		await game.attack(6, self);
	},

	async test(owner, self) {
		await self.activate(Ability.Battlecry);
		assert.equal(self.health, 4);
	},
};

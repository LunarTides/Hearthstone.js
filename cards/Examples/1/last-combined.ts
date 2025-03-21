// Created by Hand

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Combined Example 1",

	// This combines everything you've learned in this stage into one card.
	text: "<b>Taunt, Divine Shield. Battlecry: Dredge.</b> Gain +1/+1. (This example card combines everything you've learned in stage 1 into this card.)",

	cost: 1,
	type: Type.Minion,
	classes: [Class.Priest, Class.Paladin],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: 35,

	attack: 4,
	health: 4,

	// You can set the tribe to "All" to mean "This has all minion types."
	tribes: [MinionTribe.All],

	async create(owner, self) {
		// Taunt, Divine Shield

		self.addKeyword(Keyword.Taunt);
		self.addKeyword(Keyword.DivineShield);
	},

	async battlecry(owner, self) {
		// Dredge. Gain +1/+1.

		// Ordering is important. In the description it says that it dredges first, then adds +1/+1.
		await game.functions.interact.prompt.dredge();
		await self.addStats(1, 1);
	},

	// Ignore this
	async test(owner, self) {
		// Makes the player answer "1" to the next question
		owner.inputQueue = ["1"];

		// We can't really check the dredged card here.
		await self.trigger(Ability.Battlecry);

		// Check that the stats went up by 1
		assert.equal((self.blueprint.attack ?? 0) + 1, self.attack);
		assert.equal((self.blueprint.health ?? 0) + 1, self.health);
	},
};

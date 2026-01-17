// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Cant Attack Test",
	text: "<b>Cant Attack.</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-700d-9b61-74e60e250786",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Cant Attack

		self.addKeyword(Keyword.CantAttack);
	},

	async test(self, owner) {
		await owner.summon(self);

		// The card should be exhausted by default.
		assert.equal(self.attackTimes, 0);

		await game.endTurn();
		await game.endTurn();

		// But the card should still be exhausted on the next turn.
		assert.equal(self.attackTimes, 0);
	},
};

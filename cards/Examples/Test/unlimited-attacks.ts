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
	name: "Unlimited Attacks Test",
	text: "<i>Can attack any number of times.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-7006-90b5-5ad2f12ff699",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Can attack any number of times.

		// This keyword can be added to weapons as well.
		self.addKeyword(Keyword.UnlimitedAttacks);
	},

	async test(self, owner) {
		await owner.summon(self);

		self.ready();

		// The card should be not be exhausted.
		assert.notEqual(self.attackTimes, 0);

		await game.attack(self, owner.getOpponent());

		// The card should still not be exhausted.
		assert.notEqual(self.attackTimes, 0);
	},
};

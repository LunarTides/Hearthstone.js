// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Unlimited Attacks Test",
	text: "<i>Can attack any number of times.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 141,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		// Can attack any number of times.

		// This keyword can be added to weapons as well.
		self.addKeyword(Keyword.UnlimitedAttacks);
	},

	async test(owner, self) {
		await owner.summon(self);

		self.ready();
		self.resetAttackTimes();

		// The card should be not be sleepy
		assert.ok(!self.sleepy);

		await game.attack(self, owner.getOpponent());

		// The card should still not be sleepy
		assert.ok(!self.sleepy);
	},
};

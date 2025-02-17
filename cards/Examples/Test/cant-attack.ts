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
	name: "Cant Attack Test",
	text: "<b>Cant Attack.</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 134,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		// Cant Attack

		self.addKeyword(Keyword.CantAttack);
	},

	async test(owner, self) {
		await owner.summon(self);

		// The card should be sleepy by default
		assert.ok(self.sleepy);

		await game.endTurn();
		await game.endTurn();

		// But the card should still be sleepy on the next turn
		assert.ok(self.sleepy);
	},
};

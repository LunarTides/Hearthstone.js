// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Divine Shield Test",
	text: "<b>Divine Shield</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 73,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async create(self, owner) {
		self.addKeyword(Keyword.DivineShield);
	},

	async test(self, owner) {
		// There should be no minions on the board
		assert.equal(owner.board.length, 0);

		// There should be 1 minion on the board
		await owner.summon(self);
		assert.equal(owner.board.length, 1);

		// There should be 1 minion on the board since the divine shield saves it
		await game.attack(9999, self);
		assert.equal(owner.board.length, 1);

		// There should be no minions on the board since the divine shield is gone
		await game.attack(9999, self);
		assert.equal(owner.board.length, 0);
	},
};

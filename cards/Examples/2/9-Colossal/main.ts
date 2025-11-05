// Created by Hand

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
	name: "Colossal Example",
	text: "Colossal +2.",
	cost: 2,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 45,

	attack: 5,
	health: 3,
	tribes: [MinionTribe.Beast],

	async create(self, owner) {
		/*
		 * Put the names of the cards here. The "null0" is this card. You could replace it with `0`, but thats bad practice.
		 *
		 * The board will look like this
		 * Left Arm
		 * Colossal Example
		 * Right Arm
		 */
		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm_43,
			game.cardIds.null_0,
			game.cardIds.rightArm_44,
		]);
	},

	async test(self, owner) {
		await owner.summon(self);

		const board = owner.board;

		assert.ok(board.some((card) => card.id === game.cardIds.leftArm_43));
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(board.some((card) => card.id === game.cardIds.rightArm_44));
	},
};

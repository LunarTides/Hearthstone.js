// Created by Hand

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
	name: "Colossal Example",
	text: "Colossal +2.",
	cost: 2,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-7003-8002-97609d2af3ca",

	attack: 5,
	health: 3,
	tribes: [Tribe.Beast],

	async create(self, owner) {
		/*
		 * Put the names of the cards here. The "null" is this card.
		 *
		 * The board will look like this
		 * Left Arm
		 * Colossal Example
		 * Right Arm
		 */
		self.addKeyword(Keyword.Colossal, [
			// Remember to use the right ones.
			// Right: leftArm_b7bfb3c9_d353_42a6_b035_db0afa7d5eec
			// Wrong: leftArm_65ff5692_391d_42d0_861d_ef08f156e566
			// Look in the `9a-colossal-left.ts` file if you're unsure.
			game.cardIds.leftArm_019bc665_4f81_7002_90e0_0fb2951fa210,
			game.cardIds.null,
			game.cardIds.rightArm_019bc665_4f81_7004_97b1_2971ddb6a2f5,
		]);
	},

	async test(self, owner) {
		await owner.summon(self);

		const board = owner.board;

		assert.ok(
			board.some(
				(card) =>
					card.id === game.cardIds.leftArm_019bc665_4f81_7002_90e0_0fb2951fa210,
			),
		);
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(
			board.some(
				(card) =>
					card.id ===
					game.cardIds.rightArm_019bc665_4f81_7004_97b1_2971ddb6a2f5,
			),
		);
	},
};

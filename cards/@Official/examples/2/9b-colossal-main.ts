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
			// Right: left_arm[0]
			// Wrong: left_arm[1]
			// Look in the `ids.ts` file if you're unsure.
			game.ids.Official.examples.left_arm[0],
			game.ids.null,
			game.ids.Official.examples.right_arm[0],
		]);
	},

	async test(self, owner) {
		await owner.summon(self);

		const board = owner.board;

		assert.ok(
			board.some((card) => card.id === game.ids.Official.examples.left_arm[0]),
		);
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(
			board.some((card) => card.id === game.ids.Official.examples.right_arm[0]),
		);
	},
};

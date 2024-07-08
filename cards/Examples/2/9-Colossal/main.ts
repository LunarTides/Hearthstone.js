// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Colossal Example",
	text: "Colossal +2.",
	cost: 2,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 45,

	attack: 5,
	health: 3,
	tribe: "Beast",

	create(owner, self) {
		/*
		 * Put the names of the cards here. The "null0" is this card. You could replace it with `0`
		 *
		 * The board will look like this
		 * Left Arm
		 * Colossal Example
		 * Right Arm
		 */
		self.addKeyword("Colossal", [
			game.cardIds.leftArm43,
			game.cardIds.null0,
			game.cardIds.rightArm44,
		]);
	},

	test(owner, self) {
		owner.summon(self);

		const board = owner.board;

		assert.ok(board.some((card) => card.id === game.cardIds.leftArm43));
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(board.some((card) => card.id === game.cardIds.rightArm44));
	},
};

// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
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
	name: "Summon On Draw Test",
	text: "<b>Summon on Draw. Colossal +2.</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "e7b9ee97-0066-4b57-b895-e3eee0833fa7",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		self.addKeyword(Keyword.SummonOnDraw);

		// Use the preexisting colossal example minions
		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm_b7bfb3c9_d353_42a6_b035_db0afa7d5eec,
			game.cardIds.null,
			game.cardIds.rightArm_c110e696_d85e_40f1_ad2e_2718f5185e1d,
		]);
	},

	async test(self, owner) {
		// Set the player's deck and hand
		owner.deck = [
			await Card.create(
				game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
				owner,
			),
			self,
		];
		owner.hand = [];

		// Make the player draw this card
		await owner.drawCards(1);

		const board = owner.board;

		// Check if this minion and the two arms are on the board
		assert.ok(
			board.some(
				(card) =>
					card.id === game.cardIds.leftArm_b7bfb3c9_d353_42a6_b035_db0afa7d5eec,
			),
		);
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(
			board.some(
				(card) =>
					card.id ===
					game.cardIds.rightArm_c110e696_d85e_40f1_ad2e_2718f5185e1d,
			),
		);

		// Check that the player's deck is empty and the player's hand has one card (the sheep)
		assert.equal(owner.deck.length, 0);
		assert.equal(owner.hand.length, 1);
	},
};

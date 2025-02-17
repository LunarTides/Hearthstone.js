// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Summon On Draw Test",
	text: "<b>Summon on Draw. Colossal +2.</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 133,

	attack: 1,
	health: 1,
	tribe: MinionTribe.None,

	async create(owner, self) {
		self.addKeyword(Keyword.SummonOnDraw);

		// Use the preexisting colossal example minions
		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm46,
			game.cardIds.null0,
			game.cardIds.rightArm47,
		]);
	},

	async test(owner, self) {
		// Set the player's deck and hand
		owner.deck = [await Card.create(game.cardIds.sheep1, owner), self];
		owner.hand = [];

		// Make the player draw this card
		await owner.drawCards(1);

		const board = owner.board;

		// Check if this minion and the two arms are on the board
		assert.ok(board.some((card) => card.id === game.cardIds.leftArm46));
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(board.some((card) => card.id === game.cardIds.rightArm47));

		// Check that the player's deck is empty and the player's hand has one card (the sheep)
		assert.equal(owner.deck.length, 0);
		assert.equal(owner.hand.length, 1);
	},
};

// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Summon On Draw Test",
	text: "<b>Summon on Draw. Colossal +2.</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 133,

	attack: 1,
	health: 1,
	tribe: "None",

	create(plr, self) {
		self.addKeyword("Summon On Draw");

		// Use the preexisting colossal example minions
		self.addKeyword("Colossal", [
			game.cardIds.leftArm46,
			game.cardIds.null0,
			game.cardIds.rightArm47,
		]);
	},

	test(plr, self) {
		// Set the player's deck and hand
		plr.deck = [game.newCard(game.cardIds.sheep1, plr), self];
		plr.hand = [];

		// Make the player draw this card
		plr.drawCards(1);

		const board = plr.board;

		// Check if this minion and the two arms are on the board
		assert.ok(board.some((card) => card.id === game.cardIds.leftArm46));
		assert.ok(board.some((card) => card.id === self.id));
		assert.ok(board.some((card) => card.id === game.cardIds.rightArm47));

		// Check that the player's deck is empty and the player's hand has one card (the sheep)
		assert.equal(plr.deck.length, 0);
		assert.equal(plr.hand.length, 1);
	},
};

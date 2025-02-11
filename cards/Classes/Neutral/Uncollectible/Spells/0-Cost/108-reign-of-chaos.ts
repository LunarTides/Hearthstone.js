// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Reign of Chaos card.

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Reign of Chaos",
	text: "Take control of an enemy minion.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 108,

	spellSchool: "None",

	async cast(owner, self) {
		// Take control of an enemy minion.
		const card = await game.functions.interact.prompt.targetCard(
			self.text,
			self,
			"enemy",
		);
		if (!card) {
			return Card.REFUND;
		}

		await card.takeControl(owner);
		return true;
	},

	async test(owner, self) {
		// Get the opponent
		const opponent = owner.getOpponent();

		// Create a sheep and summon it on the opponent's side of the board
		const sheep = await Card.create(game.cardIds.sheep1, opponent);
		await opponent.summon(sheep);

		// Check if the sheep's owner is the opponent, is on the opponent's side of the board, and not the friendly player's side of the board
		assert.equal(sheep.owner, opponent);
		assert.ok(opponent.board.includes(sheep));
		assert.ok(!owner.board.includes(sheep));

		// Activate cast and make the player choose the sheep
		owner.inputQueue = ["1"];
		await self.activate("cast");

		// Check if the sheep's owner is the friendly player, is on this side of the board, and not the opponent's side of the board
		assert.equal(sheep.owner, owner);
		assert.ok(!opponent.board.includes(sheep));
		assert.ok(owner.board.includes(sheep));
	},
};

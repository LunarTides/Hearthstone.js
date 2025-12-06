// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Reign of Chaos card.

import { Card } from "@Game/card.ts";
import {
	Ability,
	Alignment,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Reign of Chaos",
	text: "Take control of an enemy minion.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "2ef76c34-54ca-43ca-bde2-15450178fe89",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Take control of an enemy minion.
		const card = await game.prompt.targetCard(self.text, self, {
			alignment: Alignment.Enemy,
		});
		if (!card) {
			return Card.REFUND;
		}

		await card.takeControl(owner);
		return true;
	},

	async test(self, owner) {
		// Get the opponent
		const opponent = owner.getOpponent();

		// Create a sheep and summon it on the opponent's side of the board
		const sheep = await Card.create(
			game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
			opponent,
		);
		await opponent.summon(sheep);

		// Check if the sheep's owner is the opponent, is on the opponent's side of the board, and not the friendly player's side of the board
		assert.equal(sheep.owner, opponent);
		assert.ok(opponent.board.includes(sheep));
		assert.ok(!owner.board.includes(sheep));

		// Activate cast and make the player choose the sheep
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Cast);

		// Check if the sheep's owner is the friendly player, is on this side of the board, and not the opponent's side of the board
		assert.equal(sheep.owner, owner);
		assert.ok(!opponent.board.includes(sheep));
		assert.ok(owner.board.includes(sheep));
	},
};

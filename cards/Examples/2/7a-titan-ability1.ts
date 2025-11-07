// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Ability 1",
	text: "Destroy a random enemy minion.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 79,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Destroy a random enemy minion.

		// Select an enemy minion to destroy
		const target = game.functions.util.getRandomTarget(
			false, // Don't include player 1
			false, // Don't include player 2
			owner !== game.player1, // Only include player 1's board if it's not the friendly player
			owner !== game.player2, // Only include player 2's board if it's not the friendly player
		) as Card | undefined;

		if (!target) {
			/*
			 * If there were no targets, refund the card.
			 * This will give the card back to the player and refund the mana.
			 */
			return Card.REFUND;
		}

		await target.destroy();
		return true;
	},

	async test(self, owner) {
		const opponent = owner.getOpponent();

		// Create a sheep and summon it on the opponent's side of the board
		const sheep = await Card.create(game.cardIds.sheep_1, opponent);
		await opponent.summon(sheep);

		// Kill the sheep
		await self.trigger(Ability.Cast);

		// Check if the sheep is dead
		assert.equal(owner.board.length, 0);
		assert.ok(!sheep.isAlive());
	},
};

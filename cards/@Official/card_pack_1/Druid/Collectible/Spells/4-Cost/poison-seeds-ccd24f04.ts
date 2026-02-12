// Created by the Vanilla Card Creator

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Poison Seeds",
	text: "Destroy all minions and summon 2/2 Treants to replace them.",
	cost: 4,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-700c-bb51-ccd24f0487d2",

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Destroy all minions and summon 2/2 Treants to replace them.
		for (const player of [game.player1, game.player2]) {
			for (const card of player.board) {
				await card.destroy();

				const treant = await Card.create(
					game.cardIds.treant_019bc665_4f82_7020_acf5_5269d2a84a58,
					player,
				);
				await player.summon(treant);
			}
		}
	},

	async test(self, owner) {
		const amountOfCards = 3;

		// Summon some amount of Sheep
		for (let i = 0; i < amountOfCards; i++) {
			const sheep = await Card.create(
				game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
				owner,
			);
			await owner.summon(sheep);
		}

		// Replace with Treants
		await self.trigger(Ability.Cast);

		// Check if every card is a Treant
		const board = owner.board;

		assert.equal(board.length, amountOfCards);
		assert.ok(
			board.every(
				(card) =>
					card.id === game.cardIds.treant_019bc665_4f82_7020_acf5_5269d2a84a58,
			),
		);
	},
};

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
	id: "6758597e-14c8-4465-ba21-61fe1cef1b55",

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Destroy all minions and summon 2/2 Treants to replace them.
		for (const player of [game.player1, game.player2]) {
			for (const card of player.board) {
				await card.destroy();

				const treant = await Card.create(
					game.cardIds.treant_478f59ac_1013_4687_ad32_ce4ee7bcf701,
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
				game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
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
					card.id === game.cardIds.treant_478f59ac_1013_4687_ad32_ce4ee7bcf701,
			),
		);
	},
};

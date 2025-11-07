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
	id: 82,

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Destroy all minions and summon 2/2 Treants to replace them.
		for (const player of [game.player1, game.player2]) {
			for (const card of player.board) {
				await card.destroy();

				const treant = await Card.create(game.cardIds.treant_83, player);
				await player.summon(treant);
			}
		}
	},

	async test(self, owner) {
		const amountOfCards = 3;

		// Summon some amount of Sheep
		for (let i = 0; i < amountOfCards; i++) {
			const sheep = await Card.create(game.cardIds.sheep_1, owner);
			await owner.summon(sheep);
		}

		// Replace with Treants
		await self.trigger(Ability.Cast);

		// Check if every card is a Treant
		const board = owner.board;

		assert.equal(board.length, amountOfCards);
		assert.ok(board.every((card) => card.id === game.cardIds.treant_83));
	},
};

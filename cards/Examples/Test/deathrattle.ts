// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Deathrattle Test",
	text: "<b>Deathrattle:</b> Summon two 1/1 Sheep.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-700e-9fb9-76bbe6fcd77c",

	attack: 1,
	health: 2,
	tribes: [Tribe.None],

	async deathrattle(self, owner) {
		// Summon two 1/1 Sheep.

		for (let i = 0; i < 2; i++) {
			// Create the sheep
			const sheep = await Card.create(
				game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
				owner,
			);

			// Summon the sheep
			await owner.summon(sheep);
		}
	},

	async test(self, owner) {
		// There should be 0 minions on the board
		assert.equal(owner.board.length, 0);
		await owner.summon(self);

		// There should be 1 minion on the board
		assert.equal(owner.board.length, 1);

		await game.attack(2, self);

		// There should be 2 minions on the board since the deathrattle should have triggered
		assert.equal(owner.board.length, 2);
	},
};

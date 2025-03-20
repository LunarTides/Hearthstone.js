// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Deathrattle Test",
	text: "<b>Deathrattle:</b> Summon two 1/1 Sheep.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 72,

	attack: 1,
	health: 2,
	tribes: [MinionTribe.None],

	async deathrattle(owner, self) {
		// Summon two 1/1 Sheep.

		for (let i = 0; i < 2; i++) {
			// Create the sheep
			const sheep = await Card.create(game.cardIds.sheep1, owner);

			// Summon the sheep
			await owner.summon(sheep);
		}
	},

	async test(owner, self) {
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

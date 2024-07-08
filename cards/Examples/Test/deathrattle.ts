// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Deathrattle Test",
	text: "<b>Deathrattle:</b> Summon two 1/1 Sheep.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 72,

	attack: 1,
	health: 2,
	tribe: "None",

	deathrattle(owner, self) {
		// Summon two 1/1 Sheep.

		for (let i = 0; i < 2; i++) {
			// Create the sheep
			const sheep = new Card(game.cardIds.sheep1, owner);

			// Summon the sheep
			owner.summon(sheep);
		}
	},

	test(owner, self) {
		// There should be 0 minions on the board
		assert.equal(owner.board.length, 0);
		owner.summon(self);

		// There should be 1 minion on the board
		assert.equal(owner.board.length, 1);

		game.attack(2, self);

		// There should be 2 minions on the board since the deathrattle should have triggered
		assert.equal(owner.board.length, 2);
	},
};

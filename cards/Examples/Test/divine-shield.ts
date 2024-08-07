// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Divine Shield Test",
	text: "<b>Divine Shield</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 73,

	attack: 1,
	health: 1,
	tribe: "None",

	create(owner, self) {
		self.addKeyword("Divine Shield");
	},

	test(owner, self) {
		// There should be no minions on the board
		assert.equal(owner.board.length, 0);

		// There should be 1 minion on the board
		owner.summon(self);
		assert.equal(owner.board.length, 1);

		// There should be 1 minion on the board since the divine shield saves it
		game.attack(9999, self);
		assert.equal(owner.board.length, 1);

		// There should be no minions on the board since the divine shield is gone
		game.attack(9999, self);
		assert.equal(owner.board.length, 0);
	},
};

// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Scale of Onyxia",
	text: "Fill your board with 2/1 Whelps with <b>Rush</b>.",
	cost: 7,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Common",
	collectible: true,
	id: 100,

	spellSchool: "None",

	cast(owner, self) {
		// Fill your board with 2/1 Whelps with Rush.
		const remainingBoardSpace = owner.getRemainingBoardSpace();

		for (let index = 0; index < remainingBoardSpace; index++) {
			const whelp = new Card(game.cardIds.onyxianWhelp99, owner);
			owner.summon(whelp);
		}
	},

	test(owner, self) {
		assert.equal(owner.board.length, 0);
		self.activate("cast");

		// Check if the board has been filled
		assert.equal(owner.board.length, game.config.general.maxBoardSpace);

		// Check if every card on the board is a whelp
		assert.ok(
			owner.board.every((card) => card.id === game.cardIds.onyxianWhelp99),
		);
	},
};

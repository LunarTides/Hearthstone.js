// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Oaken Summons",
	text: "Gain 6 Armor. <b>Recruit</b> a minion that costs (4) or less.",
	cost: 4,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Common",
	collectible: true,
	id: 87,

	spellSchool: "Nature",

	cast(owner, self) {
		// Gain 6 Armor. Recruit a minion that costs (4) or less.
		owner.addArmor(6);

		const list = owner.deck.filter((card) => card.cost <= 4);
		owner.recruit(list);
	},

	test(owner, self) {
		for (let index = 1; index <= 10; index++) {
			self.activate("cast");

			// Check if the armor is correct
			assert.equal(owner.armor, 6 * index);

			// Check if there exists a minion on the board that costs 4 or less
			assert.ok(
				owner.board.some(
					(card) =>
						card.cost <= 4 && card.type === "Minion" && card.uuid !== self.uuid,
				),
			);

			// Clear the board
			owner.board = [];
		}
	},
};

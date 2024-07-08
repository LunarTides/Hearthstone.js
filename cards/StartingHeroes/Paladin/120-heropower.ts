// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Reinforce",
	text: "Summon a 1/1 Silver Hand Recruit.",
	cost: 2,
	type: "Heropower",
	classes: ["Paladin"],
	rarity: "Free",
	collectible: false,
	id: 120,

	heropower(owner, self) {
		// Summon a 1/1 Silver Hand Recruit.

		// Create the Silver Hand Recruit card.
		const card = new Card(game.cardIds.silverHandRecruit20, owner);

		// Summon the card
		owner.summon(card);
	},

	test(owner, self) {
		const checkIfMinionExists = () =>
			owner.board.some((card) => card.id === 20);

		// The minion should not exist
		assert(!checkIfMinionExists());
		self.activate("heropower");

		// The minion should now exist
		assert(checkIfMinionExists());
	},
};

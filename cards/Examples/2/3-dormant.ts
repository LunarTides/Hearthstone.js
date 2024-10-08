// Created by Hand

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Dormant Example",
	text: "<b>Dormant</b> for 2 turns. <b>Battlecry:</b> Dredge.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 38,

	attack: 8,
	health: 8,
	tribe: "None",

	async create(owner, self) {
		/*
		 * The 2 is how many turns this minion should be dormant for.
		 * Full disclosure: The dormant system is one of the most untested parts of this game.
		 * If you find any bugs, please open an issue.
		 */
		self.addKeyword("Dormant", 2);
	},

	// The battlecry only triggers when the minion is no longer dormant.
	async battlecry(owner, self) {
		// Dredge.

		await game.interact.card.dredge();
	},

	async test(owner, self) {
		// TODO: Test. #325
	},
};

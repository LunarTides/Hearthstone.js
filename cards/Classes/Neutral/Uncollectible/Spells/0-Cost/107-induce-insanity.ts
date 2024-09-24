// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Induce Insanity card.

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Induce Insanity",
	text: "Force each enemy minion to attack a random enemy minion.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 107,

	spellSchool: "None",

	async cast(owner, self) {
		// Force each enemy minion to attack a random enemy minion.
		const board = owner.getOpponent().board;

		for (const enemyMinion of board) {
			const targetMinion = game.lodash.sample(board);
			if (!targetMinion) {
				continue;
			}

			await game.attack(enemyMinion, targetMinion);
		}
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

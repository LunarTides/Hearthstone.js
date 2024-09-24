// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Guile",
	text: "Add a <b>Lackey</b> to your hand.",
	cost: 2,
	type: "Heropower",
	classes: ["Rogue"],
	rarity: "Legendary",
	collectible: false,
	id: 125,

	async heropower(owner, self) {
		// Add a lacky to your hand.
		const lackeyId = game.lodash.sample(game.cardCollections.lackeys);
		if (!lackeyId) {
			return;
		}

		const lackey = await Card.create(lackeyId, owner);

		await owner.addToHand(lackey);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

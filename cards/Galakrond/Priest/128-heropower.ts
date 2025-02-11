// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Wit",
	text: "Add a random Priest minion to your hand.",
	cost: 2,
	type: "Heropower",
	classes: ["Priest"],
	rarity: "Legendary",
	collectible: false,
	tags: [],
	id: 128,

	async heropower(owner, self) {
		// Add a random Priest minion to your hand.
		const possibleCards = (await Card.all()).filter(
			(c) =>
				c.type === "Minion" &&
				game.functions.card.validateClasses(c.classes, "Priest"),
		);

		if (possibleCards.length <= 0) {
			return;
		}

		let card = game.lodash.sample(possibleCards);
		if (!card) {
			return;
		}

		card = await Card.create(card.id, owner);

		await owner.addToHand(card);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

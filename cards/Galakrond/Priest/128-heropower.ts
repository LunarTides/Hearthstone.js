// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Wit",
	text: "Add a random Priest minion to your hand.",
	cost: 2,
	type: "Heropower",
	classes: ["Priest"],
	rarity: "Legendary",
	collectible: false,
	id: 128,

	heropower(owner, self) {
		// Add a random Priest minion to your hand.
		const possibleCards = Card.all().filter(
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

		card = new Card(card.id, owner);

		owner.addToHand(card);
	},

	test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

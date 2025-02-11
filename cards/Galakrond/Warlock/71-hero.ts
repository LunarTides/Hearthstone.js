// Created by the Custom Card Creator

import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond, the Wretched",
	text: "<b>Battlecry:</b> Summon {amount} random Demon{plural}.",
	cost: 7,
	type: "Hero",
	classes: ["Warlock"],
	rarity: "Legendary",
	collectible: true,
	tags: [],
	id: 71,

	armor: 5,
	heropowerId: game.cardIds.galakrondsMalice129,

	async battlecry(owner, self) {
		// Summon 1 random Demon.
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const testDemoness = (card: Card) => {
			if (!card.tribe) {
				return false;
			}

			return game.functions.card.matchTribe(card.tribe, "Demon");
		};

		for (let i = 0; i < amount; i++) {
			// Find all demons
			const possibleCards = (await Card.all()).filter(
				(c) => c.type === "Minion" && testDemoness(c),
			);

			// Choose a random one
			let card = game.lodash.sample(possibleCards);
			if (!card) {
				break;
			}

			// Summon it
			card = await Card.create(card.id, owner);
			await owner.summon(card);
		}
	},

	async invoke(owner, self) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(owner, self) {
		if (!self.storage.invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const multiple = amount > 1;
		const plural = multiple ? "s" : "";

		return { amount, plural };
	},
};

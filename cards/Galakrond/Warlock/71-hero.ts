// Created by the Custom Card Creator

import type { Card } from "@Game/core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond, the Wretched",
	text: "<b>Battlecry:</b> Summon {amount} random Demon{plural}.",
	cost: 7,
	type: "Hero",
	classes: ["Warlock"],
	rarity: "Legendary",
	collectible: true,
	id: 71,

	armor: 5,
	heropowerId: 129,

	battlecry(plr, self) {
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
			const possibleCards = game.functions.card
				.getAll()
				.filter((c) => c.type === "Minion" && testDemoness(c));

			// Choose a random one
			let card = game.lodash.sample(possibleCards);
			if (!card) {
				break;
			}

			// Summon it
			card = game.newCard(card.id, plr);
			plr.summon(card);
		}
	},

	invoke(plr, self) {
		self.galakrondBump("invokeCount");
	},

	placeholders(plr, self) {
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

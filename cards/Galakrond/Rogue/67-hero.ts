// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond, the Nightmare",
	text: "<b>Battlecry:</b> Draw {amount} card{plural}. {plural2} costs (0).",
	cost: 7,
	type: "Hero",
	classes: ["Rogue"],
	rarity: "Legendary",
	collectible: true,
	id: 67,

	armor: 5,
	heropowerId: 125,

	battlecry(owner, self) {
		// Draw {amount} cards. They cost (0).

		// Get the amount of cards to draw
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);
		const cards = owner.drawCards(amount);

		for (const card of cards) {
			// Set the cost to 0
			card.addEnchantment("cost = 0", self);
		}
	},

	invoke(owner, self) {
		self.galakrondBump("invokeCount");
	},

	placeholders(owner, self) {
		if (!self.storage.invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);
		const multiple = amount > 1;

		const plural = multiple ? "s" : "";
		const plural2 = multiple ? "They" : "It";

		return { amount, plural, plural2 };
	},
};

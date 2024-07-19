// Created by the Custom Card Creator

import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond, the Unbreakable",
	text: "<b>Battlecry:</b> Draw {amount} minion{plural}. Give {plural2} +4/+4.",
	cost: 7,
	type: "Hero",
	classes: ["Warrior"],
	rarity: "Legendary",
	collectible: true,
	id: 69,

	armor: 5,
	heropowerId: 127,

	battlecry(owner, self) {
		// Draw 1 minion. Give them +4/+4.
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const cards = owner.drawCards(amount);

		// Draw the minions
		for (const card of cards) {
			// Give it +4/+4
			card.addStats(4, 4);
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
		const plural2 = multiple ? "them" : "it";

		return { amount, plural, plural2 };
	},
};

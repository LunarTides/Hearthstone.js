// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	CardTag,
	Class,
	EventListenerMessage,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond, the Nightmare",
	text: "<b>Battlecry:</b> Draw {amount} card{plural}. {plural2} costs (0).",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Rogue],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [CardTag.Galakrond],
	id: 67,

	armor: 5,
	heropowerId: game.cardIds.galakrondsGuile125,

	async battlecry(self, owner) {
		// Draw {amount} cards. They cost (0).

		// Get the amount of cards to draw
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const cards = await owner.drawCards(amount);

		for (const card of cards) {
			// Set the cost to 0
			card.addEnchantment("cost = 0", self);
		}
	},

	async invoke(self, owner) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(self, owner) {
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

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

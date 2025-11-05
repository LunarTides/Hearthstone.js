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
	name: "Galakrond, the Unbreakable",
	text: "<b>Battlecry:</b> Draw {amount} minion{plural}. Give {plural2} +4/+4.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Warrior],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [CardTag.Galakrond],
	id: 69,

	armor: 5,
	heropowerId: game.cardIds.galakrondsMight_127,

	async battlecry(self, owner) {
		// Draw 1 minion. Give them +4/+4.
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const cards = await owner.drawCards(amount);

		// Draw the minions
		for (const card of cards) {
			// Give it +4/+4
			await card.addStats(4, 4);
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
		const plural2 = multiple ? "them" : "it";

		return { amount, plural, plural2 };
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

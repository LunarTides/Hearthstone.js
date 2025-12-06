// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tag,
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
	tags: [Tag.Galakrond],
	id: "e176e48c-372d-4342-a7fb-d885b828f4a8",

	armor: 5,
	heropowerId:
		game.cardIds.galakrondsGuile_3a6d5242_4e2d_4092_b997_aaa41ca8cfb5,

	async battlecry(self, owner) {
		// Draw {amount} cards. They cost (0).

		// Get the amount of cards to draw
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
		);

		const cards = await owner.drawCards(amount);

		for (const card of cards) {
			// Set the cost to 0
			await card.addEnchantment(
				game.cardIds.galakrondsBlessing_a38a06d4_a803_4582_89f5_43de03e372d6,
				self,
			);
		}
	},

	async invoke(self, owner) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(self, owner) {
		const invokeCount = self.getStorage(self.uuid, "invokeCount");
		if (!invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(invokeCount);
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

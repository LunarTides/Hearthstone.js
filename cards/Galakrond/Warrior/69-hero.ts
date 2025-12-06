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
	name: "Galakrond, the Unbreakable",
	text: "<b>Battlecry:</b> Draw {amount} minion{plural}. Give {plural2} +4/+4.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Warrior],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [Tag.Galakrond],
	id: "6f79759f-3e52-46cd-871d-d354b71a41ae",

	armor: 5,
	heropowerId:
		game.cardIds.galakrondsMight_a62285a5_ae61_4e83_bea1_6340b17ff13e,

	async battlecry(self, owner) {
		// Draw 1 minion. Give them +4/+4.
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
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
		const invokeCount = self.getStorage(self.uuid, "invokeCount");
		if (!invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(invokeCount);
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

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
	name: "Galakrond, the Unspeakable",
	text: "<b>Battlecry:</b> Destroy {amount} random enemy minion{plural}.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [Tag.Galakrond],
	id: "7f8f3adf-41d4-4e83-9c4f-5836e740290e",

	armor: 5,
	heropowerId: game.cardIds.galakrondsWit_def44af8_8a84_41b7_b8ab_837e4c58f58d,

	async battlecry(self, owner) {
		// Destroy 1 random enemy minion.
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
		);

		for (let i = 0; i < amount; i++) {
			// Get a random minion from the opponent's board.
			const board = owner.getOpponent().board;

			const minion = game.lodash.sample(board);
			if (!minion) {
				continue;
			}

			// Destroy it
			await minion.destroy();
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

		return { amount, plural };
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

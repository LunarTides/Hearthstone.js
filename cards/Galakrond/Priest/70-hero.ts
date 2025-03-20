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
	name: "Galakrond, the Unspeakable",
	text: "<b>Battlecry:</b> Destroy {amount} random enemy minion{plural}.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [CardTag.Galakrond],
	id: 70,

	armor: 5,
	heropowerId: game.cardIds.galakrondsWit128,

	async battlecry(owner, self) {
		// Destroy 1 random enemy minion.
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		for (let i = 0; i < amount; i++) {
			// Get a random minion from the opponent's board.
			const board = owner.getOpponent().board;

			const minion = game.lodash.sample(board);
			if (!minion) {
				continue;
			}

			// Kill it
			await minion.kill();
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

	async test(owner, self) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

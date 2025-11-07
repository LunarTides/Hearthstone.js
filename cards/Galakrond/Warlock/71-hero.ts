// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	CardTag,
	Class,
	EventListenerMessage,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond, the Wretched",
	text: "<b>Battlecry:</b> Summon {amount} random Demon{plural}.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Warlock],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [CardTag.Galakrond],
	id: 71,

	armor: 5,
	heropowerId: game.cardIds.galakrondsMalice_129,

	async battlecry(self, owner) {
		// Summon 1 random Demon.
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
		);

		const testDemoness = (card: Card) => {
			if (!card.tribes) {
				return false;
			}

			return game.functions.card.matchTribe(card.tribes, MinionTribe.Demon);
		};

		for (let i = 0; i < amount; i++) {
			// Find all demons
			const possibleCards = (await Card.all()).filter(
				(c) => c.type === Type.Minion && testDemoness(c),
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

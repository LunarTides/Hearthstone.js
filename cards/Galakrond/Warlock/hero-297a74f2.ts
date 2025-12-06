// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tag,
	Tribe,
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
	tags: [Tag.Galakrond],
	id: "297a74f2-5a6a-4895-9482-28f67dd3c33c",

	armor: 5,
	heropowerId:
		game.cardIds.galakrondsMalice_53dba7b8_d520_4fc5_97d7_4094887f13e1,

	async battlecry(self, owner) {
		// Summon 1 random Demon.
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
		);

		const testDemoness = (card: Card) => {
			if (!card.tribes) {
				return false;
			}

			return game.functions.card.matchTribe(card.tribes, Tribe.Demon);
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

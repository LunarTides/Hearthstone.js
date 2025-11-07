// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond's Wit",
	text: "Add a random Priest minion to your hand.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Priest],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: 128,

	async heropower(self, owner) {
		// Add a random Priest minion to your hand.
		const possibleCards = (await Card.all()).filter(
			(c) =>
				c.type === Type.Minion &&
				game.functions.card.validateClasses(c.classes, Class.Priest),
		);

		if (possibleCards.length <= 0) {
			return;
		}

		let card = game.lodash.sample(possibleCards);
		if (!card) {
			return;
		}

		card = await Card.create(card.id, owner);

		await owner.addToHand(card);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

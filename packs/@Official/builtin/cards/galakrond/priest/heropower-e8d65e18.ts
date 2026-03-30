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
	id: "019bc665-4f81-701f-861c-e8d65e18c517",

	async heropower(self, owner) {
		const { card } = await Card.pool({}, ["priest", "minions"]);
		if (!card) {
			return;
		}

		await owner.addToHand(card);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

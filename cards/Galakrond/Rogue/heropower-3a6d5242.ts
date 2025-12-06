// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tag,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond's Guile",
	text: "Add a <b>Lackey</b> to your hand.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Rogue],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "3a6d5242-4e2d-4092-b997-aaa41ca8cfb5",

	async heropower(self, owner) {
		// Add a lacky to your hand.
		const lackey = game.lodash.sample(await Card.allWithTags(Tag.Lackey));
		if (!lackey) {
			return;
		}

		await owner.addToHand(await lackey.imperfectCopy());
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

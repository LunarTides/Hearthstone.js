// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	CardTag,
	Class,
	EventListenerMessage,
	Rarity,
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
	id: 125,

	async heropower(owner, self) {
		// Add a lacky to your hand.
		const lackey = game.lodash.sample(await Card.allWithTags([CardTag.Lackey]));
		if (!lackey) {
			return;
		}

		await owner.addToHand(await lackey.imperfectCopy());
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

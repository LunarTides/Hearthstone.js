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
	name: "Galakrond's Fury",
	text: "Summon a 2/1 Elemental with <b>Rush</b>.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Shaman],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "f6ebebb4-606d-4a8a-8f59-41f19ea0948a",

	async heropower(self, owner) {
		// Summon a 2/1 Elemental with Rush.
		const card = await Card.create(
			game.cardIds.windsweptElemental_e63b1490_7fb2_4edf_9a24_82742e32bbf4,
			owner,
		);
		if (!card) {
			return;
		}

		await owner.summon(card);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

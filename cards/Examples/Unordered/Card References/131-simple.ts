// Created by Hand

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Simple Card Reference Example",
	text: "The Coin: {coin}",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 131,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async create(self, owner) {
		// Store a coin for later
		self.setStorage(
			self.uuid,
			"theCoin",
			await Card.create(game.cardIds.theCoin_2, owner),
		);
	},

	async placeholders(self, owner) {
		/*
		 * You can reference entire cards in placeholders.
		 * Go in-game, give yourself this card, and type 'detail' to see how it works.
		 * We use the card's storage so we don't create a bajillion cards and cause memory leaks.
		 */
		const coin = self.getStorage(self.uuid, "theCoin") as Card | undefined;

		return { coin };
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

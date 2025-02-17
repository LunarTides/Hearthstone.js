// Created by Hand

import { Card } from "@Core/card.js";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

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
	tribe: MinionTribe.None,

	async create(owner, self) {
		// Store a coin for later
		self.storage.the_coin = await Card.create(game.cardIds.theCoin2, owner);
	},

	async placeholders(owner, self) {
		/*
		 * You can reference entire cards in placeholders.
		 * Go in-game, give yourself this card, and type 'detail' to see how it works.
		 * We use the card's storage so we don't create a bajillion cards and cause memory leaks.
		 */
		const coin = self.storage.the_coin as Card | undefined;

		return { coin };
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

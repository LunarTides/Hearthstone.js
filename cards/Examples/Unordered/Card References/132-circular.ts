// Created by Hand

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Circular Card Reference Example",
	text: "Circular card reference: {card}",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 132,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async placeholders(self, owner) {
		/*
		 * You can reference this card in placeholders.
		 * Go in-game, give yourself this card, and type 'detail' to see how it works.
		 */

		// It will eventually reach a max depth, which is set in the config.
		return { card: self };
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

// Created by Hand

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

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
	tribe: MinionTribe.None,

	async placeholders(owner, self) {
		/*
		 * You can reference this card in placeholders.
		 * Go in-game, give yourself this card, and type 'detail' to see how it works.
		 */

		// It will eventually reach a max depth, which is set in the config.
		return { card: self };
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

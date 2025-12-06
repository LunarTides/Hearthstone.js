// Created by Hand

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Combined Example 2 Corrupted",
	text: "Colossal +2. Dormant. Corrupted. <b>Battlecry: Dredge.</b>",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "6bc4d4f5-e2fa-4a92-9417-368e1b2fe47d",

	attack: 9,
	health: 9,
	tribes: [Tribe.None],

	async create(self, owner) {
		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm_65ff5692_391d_42d0_861d_ef08f156e566,
			game.cardIds.null,
			game.cardIds.rightArm_233440a8_4966_4a88_94b0_b964a52ebf30,
		]);

		self.addKeyword(Keyword.Dormant, 2);
	},

	async battlecry(self, owner) {
		// Dredge.

		await game.prompt.dredge();
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

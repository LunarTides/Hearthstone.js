// Created by Hand

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Keyword,
	Rarity,
	Rune,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Combined Example 2",
	text: "Colossal +2. Dormant. Corrupt.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-7006-b0b5-783df0e82116",

	attack: 5,
	health: 3,
	tribes: [Tribe.None],

	async create(self, owner) {
		self.runes = [Rune.Blood, Rune.Blood, Rune.Blood];

		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm_019bc665_4f81_7005_b675_5fa77378254f,
			game.cardIds.null,
			game.cardIds.rightArm_019bc665_4f81_7008_a1d2_e9cb03cb8a67,
		]);

		self.addKeyword(
			Keyword.Corrupt,
			game.cardIds
				.combinedExample2Corrupted_019bc665_4f81_7007_a2cb_2144aff06a6e,
		);

		// The summoned minions get Dormant automatically if the main minion has dormant.
		self.addKeyword(Keyword.Dormant, 2);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

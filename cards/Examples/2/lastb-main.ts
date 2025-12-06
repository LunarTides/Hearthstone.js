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
	id: "9c1e8082-9ba5-489d-be0d-2b2c75fc1cb3",

	attack: 5,
	health: 3,
	tribes: [Tribe.None],

	async create(self, owner) {
		self.runes = [Rune.Blood, Rune.Blood, Rune.Blood];

		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm_65ff5692_391d_42d0_861d_ef08f156e566,
			game.cardIds.null,
			game.cardIds.rightArm_233440a8_4966_4a88_94b0_b964a52ebf30,
		]);

		self.addKeyword(
			Keyword.Corrupt,
			game.cardIds
				.combinedExample2Corrupted_6bc4d4f5_e2fa_4a92_9417_368e1b2fe47d,
		);

		// The summoned minions get Dormant automatically if the main minion has dormant.
		self.addKeyword(Keyword.Dormant, 2);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

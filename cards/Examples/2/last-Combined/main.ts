// Created by Hand

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Combined Example 2",
	text: "Colossal +2. Dormant. Corrupt.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: 48,

	attack: 5,
	health: 3,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		self.runes = "BBB";

		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm46,
			game.cardIds.null0,
			game.cardIds.rightArm47,
		]);

		self.addKeyword(Keyword.Corrupt, game.cardIds.combinedExample2Corrupted49);

		// The summoned minions get Dormant automatically if the main minion has dormant.
		self.addKeyword(Keyword.Dormant, 2);
	},

	async test(owner, self) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

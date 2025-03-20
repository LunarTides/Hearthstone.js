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
	id: 49,

	attack: 9,
	health: 9,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		self.addKeyword(Keyword.Colossal, [
			game.cardIds.leftArm46,
			game.cardIds.null0,
			game.cardIds.rightArm47,
		]);

		self.addKeyword(Keyword.Dormant, 2);
	},

	async battlecry(owner, self) {
		// Dredge.

		await game.functions.interact.prompt.dredge();
	},

	async test(owner, self) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

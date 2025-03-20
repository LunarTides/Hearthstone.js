// Created by the Custom Card Creator

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
	name: "Titan Example",
	text: "<b>Titan</b>.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 78,

	attack: 10,
	health: 10,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		// Put the ids of the titan ability cards, like in corrupt, but a list.
		self.addKeyword(Keyword.Titan, [
			// This looks a bit confusing.
			// This means the name is "ability1" with id 79, not "ability" with id 179.
			game.cardIds.ability179,
			game.cardIds.ability280,
			game.cardIds.ability381,
		]);
	},

	async test(owner, self) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Forge Example",
	text: "<b>Forge:</b> Gain +1/+1.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 75,

	attack: 1,
	health: 1,
	tribe: MinionTribe.None,

	async create(owner, self) {
		// Put the id of the forged counterpart, like in corrupt.
		self.addKeyword(Keyword.Forge, game.cardIds.forgedExample76);
	},
};

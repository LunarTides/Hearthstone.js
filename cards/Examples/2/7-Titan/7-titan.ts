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
	tribe: MinionTribe.None,

	async create(owner, self) {
		// Put the ids of the titan ability cards, like in corrupt, but a list.
		self.addKeyword(Keyword.Titan, [
			game.cardIds.ability179,
			game.cardIds.ability280,
			game.cardIds.ability381,
		]);
	},
};

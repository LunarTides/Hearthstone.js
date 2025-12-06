// Created by the Custom Card Creator

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
	name: "Titan Example",
	text: "<b>Titan</b>.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "ea78e85b-ba81-41f3-a677-af52041ee1c9",

	attack: 10,
	health: 10,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Put the ids of the titan ability cards, like in corrupt, but a list.
		self.addKeyword(Keyword.Titan, [
			game.cardIds.ability1_c01749a3_fdf2_4466_8628_858b239ddd92,
			game.cardIds.ability2_f7886c3e_3473_442b_9513_7de9306dbf3e,
			game.cardIds.ability3_f62bed5a_647a_45e3_8d2e_c27f16764481,
		]);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

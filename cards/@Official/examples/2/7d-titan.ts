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
	id: "019bc665-4f81-7000-8faa-89022618a028",

	attack: 10,
	health: 10,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Put the ids of the titan ability cards, like in corrupt, but a list.
		self.addKeyword(Keyword.Titan, [
			game.cardIds.ability1_019bc665_4f80_702e_803a_28c25a963fff,
			game.cardIds.ability2_019bc665_4f80_702f_aa1a_88585939e5af,
			game.cardIds.ability3_019bc665_4f80_7030_81b2_752f0b48159f,
		]);
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};

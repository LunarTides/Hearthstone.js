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
	name: "Forgetful Test",
	text: "<i>50% Chance to attack the wrong enemy.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-7014-b27d-0df49cee47fc",

	attack: 5,
	health: 4,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Forgetful

		self.addKeyword(Keyword.Forgetful);
	},

	async test(self, owner) {
		// TODO: Test #325
		return EventListenerMessage.Skip;

		// 1 await owner.summon(self);

		/*
		 * 2 const sheep = game.newCard(game.ids.Official.builtin.sheep[0], owner.getOpponent());
		 * 3 await owner.getOpponent().summon(sheep);
		 */

		/*
		 * 4 for (let i = 0; i < 10; i++) {
		 * 5     if (!sheep.isAlive()) {
		 * 6         break;
		 * 7     }
		 */

		/*
		 * 8   self.ready();
		 */

		/*
		 * 9    await game.attack(self, owner.getOpponent());
		 * 10 }
		 */

		// assert(!sheep.isAlive());
	},
};

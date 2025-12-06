// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Induce Insanity card.

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Induce Insanity",
	text: "Force each enemy minion to attack a random enemy minion.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "961ce6f6-2963-4ee1-8e25-64a06c9ca714",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Force each enemy minion to attack a random enemy minion.
		const board = owner.getOpponent().board;

		for (const enemyMinion of board) {
			const targetMinion = game.lodash.sample(board);
			if (!targetMinion) {
				continue;
			}

			// TODO: Make sure that `force` is actually correct here.
			await game.attack(enemyMinion, targetMinion, { force: true });
		}
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

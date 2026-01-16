// Created by Hand

import {
	type Blueprint,
	Class,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "DIY 1",
	text: "<b>This is a DIY card, it does not work by default. Battlecry:</b> Give this minion +1/+1.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.DIY],
	id: "019bc665-4f80-7009-b04d-ae81c5b283e6",

	attack: 0,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Give this minion +1/+1.

		// Try to give this minion +1/+1 yourself.

		/*
		 * -----------------------------------------
		 * | DON'T CHANGE ANYTHING BELOW THIS LINE |
		 * -----------------------------------------
		 *
		 * There are also some spoilers about the solution in the verification process down below,
		 * so if you don't want to see it, don't scroll down
		 */

		// Testing your solution.
		const success = await game.functions.card.verifyDiySolution(
			self.attack === 1 && self.health === 2,
			self,
		);

		if (!success) {
			await self.destroy();
		}

		return true;
	},
};

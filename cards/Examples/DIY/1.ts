// Created by Hand

import {
	type Blueprint,
	CardTag,
	Class,
	MinionTribe,
	Rarity,
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
	tags: [CardTag.DIY],
	id: 61,

	attack: 0,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
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
			await self.kill();
		}

		return true;
	},
};

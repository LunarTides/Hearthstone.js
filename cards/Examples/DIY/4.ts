// Created by Hand

import {
	type Blueprint,
	Class,
	Event,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "DIY 4",
	text: "<b>This is a DIY card, it does not work by default.</b> Whenever a friendly minion dies, Resurrect it with 1/1 stats.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.DIY],
	id: "5b4c8a32-2c4c-4d98-b77c-0a1591d5224e",

	attack: 0,
	health: 10,
	tribes: [Tribe.None],

	async passive(self, owner, key, value, eventPlayer) {
		// Whenever a minion dies, Resurrect it with 1/1 stats.

		// If the key is for a different event, stop the function.
		if (!game.event.is(key, value, Event.DestroyCard)) {
			return;
		}

		// Don't change this line
		if (value.owner !== owner) {
			return;
		}

		/*
		 * Try to:
		 * 1. Resurrect the minion (value) with 1/1 stats.
		 */

		// THIS ONLY GETS VALIDATED ONCE A MINION DIES. PLEASE TRY TO CAUSE A MINION TO DIE IN ORDER TO VALIDATE YOUR SOLUTION

		/*
		 * -----------------------------------------
		 * | DON'T CHANGE ANYTHING BELOW THIS LINE |
		 * -----------------------------------------
		 *
		 * There are also some spoilers about the solution in the verification process down below,
		 * so if you don't want to see it, don't scroll down
		 */

		// Testing your solution.
		if (self.getStorage(self.uuid, "solved")) {
			return true;
		}

		const solved = owner.board.some(
			(card) =>
				card.id === value.id &&
				card.type === value.type &&
				card.attack === 1 &&
				card.health === 1 &&
				card.uuid !== value.uuid &&
				card.owner === owner,
		);

		await game.functions.card.verifyDiySolution(solved, self);

		if (!solved) {
			await self.destroy();
		}

		self.setStorage(self.uuid, "solved", true);
		return true;
	},
};

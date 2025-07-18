// Created by Hand

import {
	type Blueprint,
	CardTag,
	Class,
	Event,
	MinionTribe,
	Rarity,
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
	tags: [CardTag.DIY],
	id: 64,

	attack: 0,
	health: 10,
	tribes: [MinionTribe.None],

	async passive(owner, self, key, value, eventPlayer) {
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
		if (self.storage.solved) {
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

		self.storage.solved = true;
		return true;
	},
};

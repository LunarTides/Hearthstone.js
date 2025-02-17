// Created by Hand

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Dredge Example",
	text: "This example card shows you how to use keywords like dredge. <b>Battlecry: Dredge.</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 34,

	attack: 1,
	health: 1,
	tribe: MinionTribe.None,

	async battlecry(owner, self) {
		// Dredge.

		// "game.functions.interact" is an instance of the interact object as defined in `src/core/functions/interact.ts`.
		await game.functions.interact.prompt.dredge();
	},

	// Ignore this
	async test(owner, self) {
		// Makes the player answer "1" to the next question
		owner.inputQueue = ["1"];
		const card = await game.functions.interact.prompt.dredge();

		// Check if the top card of the player's deck is the card that was dredged
		assert.equal(game.lodash.last(owner.deck), card);
	},
};

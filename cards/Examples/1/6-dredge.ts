// Created by Hand

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Dredge Example",
	text: "This example card shows you how to use keywords like dredge. <b>Battlecry: Dredge.</b>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 34,

	attack: 1,
	health: 1,
	tribe: "None",

	async battlecry(owner, self) {
		// Dredge.

		// "game.interact" is an instance of the Interact object as defined in `src/core/interact/index.ts`.
		await game.interact.card.dredge();
	},

	// Ignore this
	async test(owner, self) {
		// Makes the player answer "1" to the next question
		owner.inputQueue = ["1"];
		const card = await game.interact.card.dredge();

		// Check if the top card of the player's deck is the card that was dredged
		assert.equal(game.lodash.last(owner.deck), card);
	},
};

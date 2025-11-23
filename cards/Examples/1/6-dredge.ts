// Created by Hand

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";
import assert from "node:assert";

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
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Dredge.

		// "game.prompt" links to "game.functions.interact.prompt", which is an instance of the interact object as defined in `src/functions/interact.ts`.
		await game.prompt.dredge();
	},

	// Ignore this
	async test(self, owner) {
		// Makes the player answer "1" to the next question
		owner.inputQueue = ["1"];
		const card = await game.prompt.dredge();

		// Check if the top card of the player's deck is the card that was dredged
		assert.equal(game.lodash.last(owner.deck), card);
	},
};

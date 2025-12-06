// Created by Hand

import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Battlecry Example",

	/*
	 * Remember to look at the text of these example cards to know what they're trying to do.
	 * Beyond this point, few cards will have comments like these above the text.
	 */
	text: "<b>Battlecry:</b> Give this minion +1/+1.",

	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "8bec50ab-2bfb-42ce-b54c-9f5f0a41c605",

	attack: 1,
	health: 2,
	tribes: [Tribe.None],

	/*
	 * Here we put the name of the ability we want to add.
	 * The card creator should be able to automatically add the correct ability but as of writing, it can only add a single ability per card.
	 * So if you want to add multiple abilities, you'll have to do it manually.
	 *
	 * Instead of "battlecry", you could put "deathrattle", or "inspire", for example.
	 */
	async battlecry(self, owner) {
		// Give this minion +1/+1.

		/*
		 * The `self` variable is the actual card itself in-game. This is an instance of the Card class as defined in `src/card.ts`.
		 * The `owner` variable is the card's owner. This is an instance of the Player class as defined in `src/player.ts`.
		 *
		 * The global `game` variable (used later on) is the current game. This is an instance of the Game class as defined in `src/game.ts`.
		 */

		// The card class has the "addStats" function that takes in an attack and health, then adds that to the current stats.
		await self.addStats(1, 1);
	},

	/*
	 * Ignore this, this is just to unit test this card to make sure it doesn't break in the future.
	 * I encourage you to make tests like these yourself. Run `bun ./scripts/test/cards.ts` to run these tests.
	 * These tests are run in an isolated environment. The side-effect of the code here won't carry over to other tests or the game.
	 */
	async test(self, owner) {
		await self.trigger(Ability.Battlecry);

		assert.equal(self.blueprint.attack! + 1, self.attack);
		assert.equal(self.blueprint.health! + 1, self.health);
	},
};

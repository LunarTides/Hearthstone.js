// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Condition Example",

	// This is a common condition.
	text: "<b>Battlecry:</b> If your deck has no duplicates, draw a card.",

	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 52,

	attack: 5,
	health: 2,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
		// If your deck has no duplicates, draw a card.

		// Check if the condition is cleared.
		if (!(await self.condition())) {
			return;
		}

		// Draw a card
		await owner.drawCards(1);
	},

	/*
	 * This function will run when the card is played.
	 * It will also run every tick in order to add / remove the `(Condition cleared!)` text,
	 * so don't do too many expensive things in here. (Make use of `self.storage` or `game.cache` if you need to.)
	 */
	async condition(owner, self) {
		/*
		 * `owner.highlander()` will return true if the player has no duplicates in their deck.
		 *
		 * return true; // Uncomment this to see how a fulfilled condition looks like.
		 */
		return owner.highlander();
	},

	async test(owner, self) {
		const { length } = owner.deck;
		owner.hand = [];

		// The player shouldn't fulfill the condition
		assert(!owner.highlander());
		await self.trigger(Ability.Battlecry);

		// Assert that the player didn't draw a card
		assert.equal(owner.deck.length, length);
		assert.equal(owner.hand.length, 0);

		// The player should fulfill the condition
		owner.deck = [await Card.create(game.cardIds.sheep1, owner)];
		assert(owner.highlander());
		assert.equal(owner.deck.length, 1);

		await self.trigger(Ability.Battlecry);

		assert.equal(owner.hand.length, 1);
	},
};

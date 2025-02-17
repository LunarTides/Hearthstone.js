// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Discover Example",
	text: "Discover a spell.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 51,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Discover a spell.

		/*
		 * The discover function needs a list of cards to choose from.
		 * This list will act like a pool of cards.
		 */

		// This gets every card from the game, excluding uncollectible cards.
		let pool = await Card.all();

		// We need to filter away any non-spell cards.
		pool = pool.filter((c) => c.type === Type.Spell);

		// game.functions.interact.discover(prompt, pool, ifItShouldFilterAwayCardsThatAreNotThePlayersClass = true, amountOfCardsToChooseFrom = 3)
		const spell = await game.functions.interact.prompt.discover(
			"Discover a spell.",
			pool,
		);

		// If no card was chosen, refund
		if (!spell) {
			return Card.REFUND;
		}

		// Now we need to actually add the card to the player's hand
		await owner.addToHand(spell);
		return true;
	},

	async test(owner, self) {
		owner.inputQueue = "1";
		owner.hand = [];

		for (let i = 0; i < 50; i++) {
			await self.activate(Ability.Cast);

			const card = owner.hand.pop();

			assert(card);
			assert.equal(card.type, "Spell");
			assert(
				Boolean(card) &&
					game.functions.card.validateClasses(card.classes, owner.heroClass),
			);
		}
	},
};

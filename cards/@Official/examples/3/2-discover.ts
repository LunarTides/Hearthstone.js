// Created by Hand

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Discover Example",
	text: "Discover a spell.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-701d-8045-9584a8b02fc7",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Discover a spell.

		/*
		 * The discover function needs a list of cards to choose from.
		 * This list will act like a pool of cards.
		 */

		// This gets every card from the game, excluding uncollectible cards.
		let pool = await Card.all();

		// Filter the pool to only include spells.
		pool = pool.filter((c) => c.type === Type.Spell);

		// discover(prompt, pool, ifItShouldFilterAwayCardsThatAreNotThePlayersClass = true, amountOfCardsToChooseFrom = 3)
		const spell = await game.prompt.discover("Discover a spell.", pool);

		// If no card was chosen, refund.
		if (!spell) {
			return Card.REFUND;
		}

		// Now we need to actually add the card to the player's hand.
		await owner.addToHand(spell);
		return true;
	},

	async test(self, owner) {
		owner.inputQueue = "1";
		owner.hand = [];

		for (let i = 0; i < 50; i++) {
			await self.trigger(Ability.Cast);

			const card = await owner.popFromHand();

			assert(card);
			assert.equal(card.type, "Spell");
			assert(
				Boolean(card) &&
					game.functions.card.validateClasses(card.classes, owner.heroClass),
			);
		}
	},
};

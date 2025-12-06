// Created by Hand (before the Card Creator Existed)

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Ethereal Lackey",
	text: "<b>Battlecry: Discover</b> a spell.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Lackey],
	id: "a2aa317f-f0cc-45f9-b92f-2cbbbda579f4",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Discover a spell.

		// Filter out all cards that aren't spells
		const pool = (await Card.all()).filter((c) => c.type === Type.Spell);
		if (pool.length <= 0) {
			return;
		}

		// Prompt a discover
		const card = await game.prompt.discover("Discover a spell.", pool);
		if (!card) {
			return Card.REFUND;
		}

		// Add the card to the player's hand
		await owner.addToHand(card);
		return true;
	},

	async test(self, owner) {
		// If there are no spells, pass the test
		if (
			(await Card.all()).filter(
				(c) =>
					c.type === Type.Spell &&
					game.functions.card.validateClasses(self.classes, owner.heroClass),
			).length <= 0
		) {
			return;
		}

		// The player ALWAYS answer 1.
		owner.inputQueue = "1";

		// Do this 50 times
		for (let i = 0; i < 50; i++) {
			// Activate the battlecry and get the card from the player's hand.
			owner.hand = [];
			await self.trigger(Ability.Battlecry);
			const card = owner.hand[0];

			assert.equal(card.type, "Spell");
		}
	},
};

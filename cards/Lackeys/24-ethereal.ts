// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Ethereal Lackey",
	text: "<b>Battlecry: Discover</b> a spell.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: ["lackey"],
	id: 24,

	attack: 1,
	health: 1,
	tribe: "None",

	async battlecry(owner, self) {
		// Discover a spell.

		// Filter out all cards that aren't spells
		const pool = (await Card.all()).filter((c) => c.type === "Spell");
		if (pool.length <= 0) {
			return;
		}

		// Prompt a discover
		const card = await game.functions.interact.promptDiscover(
			"Discover a spell.",
			pool,
		);
		if (!card) {
			return Card.REFUND;
		}

		// Add the card to the player's hand
		await owner.addToHand(card);
		return true;
	},

	async test(owner, self) {
		// If there are no spells, pass the test
		if (
			(await Card.all()).filter(
				(c) =>
					c.type === "Spell" &&
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
			await self.activate("battlecry");
			const card = owner.hand[0];

			assert.equal(card.type, "Spell");
		}
	},
};

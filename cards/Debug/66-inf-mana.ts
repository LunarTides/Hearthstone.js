// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Inf Mana",
	text: "Fill up your mana. For the rest of the game, your mana never decreases.",
	cost: 0,
	type: "Spell",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 66,

	spellSchool: "None",

	async cast(owner, self) {
		// Fill up your mana. For the rest of the game, your mana never decreases.

		/*
		 * Gain max mana every tick.
		 * This lasts for the rest of the game, since we don't unhook it.
		 */
		game.functions.event.hookToTick(async () => {
			owner.addMana(owner.maxMana);
		});
	},

	async test(owner, self) {
		owner.mana = 5;
		await self.activate("cast");

		// The game hasn't ticked yet
		assert.equal(owner.mana, 5);

		// Manually tick the game
		await game.event.tick("GameLoop", undefined, owner);

		assert.equal(owner.mana, 10);

		// Play a card to verify that the mana doesn't decrease
		const card = await Card.create(game.cardIds.sheep1, owner);
		const result = await game.play(card, owner);

		assert.equal(result, true);
		assert.equal(owner.mana, 10);
	},
};

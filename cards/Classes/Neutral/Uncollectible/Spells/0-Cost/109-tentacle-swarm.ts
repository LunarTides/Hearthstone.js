// Created by the Vanilla Card Creator

// This is the Yogg-Saron, Unleashed Tentacle Swarm card.

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Tentacle Swarm",
	text: "Fill your hand with 1/1 Chaotic Tendrils.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 109,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Fill your hand with 1/1 Chaotic Tendrils.
		const remaining = owner.getRemainingHandSpace();

		for (let index = 0; index < remaining; index++) {
			const card = await Card.create(game.cardIds.chaoticTendril110, owner);
			await owner.addToHand(card);
		}
	},

	async test(self, owner) {
		const handSize = owner.hand.length;
		await self.trigger(Ability.Cast);

		// Check if the player's hand was filled with tendrils
		const amountOfCards = owner.hand.length - handSize;
		assert.equal(
			owner.hand.filter((card) => card.id === game.cardIds.chaoticTendril110)
				.length,
			amountOfCards,
		);
	},
};

// Created by Hand (before the Card Creator Existed)

import { Card } from "@Game/card.ts";
import {
	Ability,
	Alignment,
	type Blueprint,
	Class,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Witchy Lackey",
	text: "<b>Battlecry:</b> Transform a friendly minion into one that costs (1) more.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Lackey],
	id: "39591f26-9ab3-455d-b4db-331ca8fca293",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Transform a friendly minion into one that costs (1) more.

		// Ask the user which minion to transform
		const target = await game.prompt.targetCard(
			"Transform a friendly minion into one that costs (1) more.",
			self,
			{ alignment: Alignment.Friendly },
		);

		// If no target was selected, refund
		if (!target) {
			return Card.REFUND;
		}

		// There isn't any cards that cost more than 10, so refund
		if (target.cost >= 10) {
			return Card.REFUND;
		}

		// Filter minions that cost (1) more than the target
		const minions = (await Card.all()).filter(
			(card) => card.type === Type.Minion && card.cost === target.cost + 1,
		);

		// Choose a random minion from the filtered list.
		const random = game.lodash.sample(minions);
		if (!random) {
			return Card.REFUND;
		}

		// Create the card
		const minion = await Card.create(random.id, owner);

		// Destroy the target and summon the new minion in order to get the illusion that the card was transformed
		await target.removeFromPlay();

		// Summon the card to the player's side of the board
		await owner.summon(minion);
		return true;
	},

	async test(self, owner) {
		const existsMinionWithCost = (cost: number) =>
			owner.board.some((card) => card.cost === cost);

		// Summon a sheep
		const sheep = await Card.create(
			game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
			owner,
		);
		await owner.summon(sheep);

		// There shouldn't exist a minion with 1 more cost than the sheep.
		assert(!existsMinionWithCost(sheep.cost + 1));

		// If there doesn't exist any 2-Cost minions, pass the test
		if (
			!(await Card.all()).some(
				(card) => card.cost === sheep.cost + 1 && card.type === Type.Minion,
			)
		) {
			return;
		}

		// Activate the battlecry, select the sheep.
		owner.inputQueue = ["f0"];
		await self.trigger(Ability.Battlecry);

		// There should now exist a minion with 1 more cost than the sheep.
		assert(existsMinionWithCost(sheep.cost + 1));
	},
};

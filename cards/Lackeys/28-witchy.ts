// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	CardTag,
	Class,
	MinionTribe,
	Rarity,
	TargetAlignment,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Witchy Lackey",
	text: "<b>Battlecry:</b> Transform a friendly minion into one that costs (1) more.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.Lackey],
	id: 28,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
		// Transform a friendly minion into one that costs (1) more.

		// Ask the user which minion to transform
		const target = await game.functions.interact.prompt.targetCard(
			"Transform a friendly minion into one that costs (1) more.",
			self,
			TargetAlignment.Friendly,
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

	async test(owner, self) {
		const existsMinionWithCost = (cost: number) =>
			owner.board.some((card) => card.cost === cost);

		// Summon a sheep
		const sheep = await Card.create(game.cardIds.sheep1, owner);
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
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Battlecry);

		// There should now exist a minion with 1 more cost than the sheep.
		assert(existsMinionWithCost(sheep.cost + 1));
	},
};

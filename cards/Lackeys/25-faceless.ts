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
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Faceless Lackey",
	text: "<b>Battlecry:</b> Summon a random 2-Cost minion.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.Lackey],
	id: 25,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(self, owner) {
		// Summon a random 2-Cost minion.

		// filter out all cards that aren't 2-cost minions
		const minions = (await Card.all()).filter(
			(card) => card.type === Type.Minion && card.cost === 2,
		);

		// Choose a random minion
		const random = game.lodash.sample(minions);
		if (!random) {
			return;
		}
		// Summon the minion
		await owner.summon(await random.imperfectCopy());
	},

	async test(self, owner) {
		// If there doesn't exist any 2-Cost minions, pass the test
		if (
			!(await Card.all()).some(
				(card) => card.cost === 2 && card.type === Type.Minion,
			)
		) {
			return;
		}

		const exists2CostMinion = () => owner.board.some((card) => card.cost === 2);

		// There shouldn't exist any 2-Cost minions right now.
		assert(!exists2CostMinion());
		await self.trigger(Ability.Battlecry);

		// There should exist a 2-Cost minion now.
		assert(exists2CostMinion());
	},
};

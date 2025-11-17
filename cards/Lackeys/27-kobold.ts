// Created by Hand (before the Card Creator Existed)

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
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Kobold Lackey",
	text: "<b>Battlecry:</b> Deal 2 damage.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.Lackey],
	id: 27,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(self, owner) {
		// Deal 2 damage.

		// Select a target
		const target = await game.prompt.target("Deal 2 damage.", self);

		// If no target was selected, refund
		if (!target) {
			return Card.REFUND;
		}

		// Deal 2 damage to the target
		await game.attack(2, target);
		return true;
	},

	async test(self, owner) {
		owner.inputQueue = ["face", "y"];
		await self.trigger(Ability.Battlecry);

		assert.equal(owner.getOpponent().health, 30 - 2);
		assert.equal(owner.inputQueue, undefined);
	},
};

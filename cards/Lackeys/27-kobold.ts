// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Core/card.js";
import {
	Ability,
	type Blueprint,
	CardTag,
	Class,
	MinionTribe,
	Rarity,
	TargetAlignment,
	TargetClass,
	Type,
} from "@Game/types.js";

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
	tribe: MinionTribe.None,

	async battlecry(owner, self) {
		// Deal 2 damage.

		// Select a target
		const target = await game.functions.interact.prompt.target(
			"Deal 2 damage.",
			self,
			TargetAlignment.Any,
			TargetClass.Any,
		);

		// If no target was selected, refund
		if (!target) {
			return Card.REFUND;
		}

		// Deal 2 damage to the target
		await game.attack(2, target);
		return true;
	},

	async test(owner, self) {
		owner.inputQueue = ["face", "y"];
		await self.activate(Ability.Battlecry);

		assert.equal(owner.getOpponent().health, 30 - 2);
		assert.equal(owner.inputQueue, undefined);
	},
};

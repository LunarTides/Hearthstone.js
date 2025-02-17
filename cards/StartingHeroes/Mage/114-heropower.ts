// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	TargetAlignment,
	TargetClass,
	TargetFlag,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Fireblast",
	text: "Deal 1 damage.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Mage],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 114,

	async heropower(owner, self) {
		// Deal 1 damage.

		// Use of `prompt.target` in the `heropower` ability requires the use of the `ForceElusive` flag
		const target = await game.functions.interact.prompt.target(
			"Deal 1 damage.",
			self,
			TargetAlignment.Any,
			TargetClass.Any,
			[TargetFlag.ForceElusive],
		);

		// If no target was selected, refund the hero power
		if (!target) {
			return Card.REFUND;
		}

		// Deal 1 damage to the target
		await game.attack(1, target);
		return true;
	},

	async test(owner, self) {
		// The opponent should have 30 health.
		assert.equal(owner.getOpponent().health, 30);

		owner.inputQueue = ["face", "y"];
		await self.activate(Ability.HeroPower);

		// The opponent should have 29 health.
		assert.equal(owner.getOpponent().health, 30 - 1);
	},
};

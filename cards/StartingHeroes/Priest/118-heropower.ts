// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Lesser Heal",
	text: "Restore 2 Health.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Priest],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 118,

	async heropower(owner, self) {
		// Restore 2 Health.

		const target = await game.functions.interact.prompt.target(
			"Restore 2 health.",
			self,
		);

		// If no target was selected, refund the hero power
		if (!target) {
			return Card.REFUND;
		}

		// Restore 2 health to the target
		await target.addHealth(2, true);
		return true;
	},

	async test(owner, self) {
		// Health: 1->3
		owner.health = 1;
		owner.inputQueue = ["face", "n"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.health, 1 + 2);

		// Health: 29->30 (cap at 30)
		owner.health = 29;
		owner.inputQueue = ["face", "n"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.health, 30);
	},
};

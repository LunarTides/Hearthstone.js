// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Lesser Heal",
	text: "Restore 2 Health.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Priest],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-700f-baf6-98a416f07ccc",

	async heropower(self, owner) {
		// Restore 2 Health.

		const target = await game.prompt.target("Restore 2 health.", self);

		// If no target was selected, refund the hero power
		if (!target) {
			return Card.REFUND;
		}

		// Restore 2 health to the target
		await target.addHealth(2, true);
		return true;
	},

	async test(self, owner) {
		// Health: 1->3
		owner.health = 1;
		owner.inputQueue = ["pf"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.health, 1 + 2);

		// Health: 29->30 (cap at 30)
		owner.health = 29;
		owner.inputQueue = ["pf"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.health, 30);
	},
};

// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Dagger Mastery",
	text: "Equip a 1/2 Dagger.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Rogue],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-700d-a506-ab6b58fb0eea",

	async heropower(self, owner) {
		// Equip a 1/2 Dagger.

		// Create the weapon card
		const weapon = await Card.create(
			game.cardIds.wickedKnife_019bc665_4f81_700c_9393_55d79a04e156,
			owner,
		);

		// Equip the weapon
		await owner.setWeapon(weapon);
	},

	async test(self, owner) {
		// The player should not have a weapon
		assert.equal(owner.weapon, undefined);
		await self.trigger(Ability.HeroPower);

		// The player should now have the wicked knife weapon
		assert.ok(owner.weapon);
		assert.equal(
			owner.weapon.id,
			game.cardIds.wickedKnife_019bc665_4f81_700c_9393_55d79a04e156,
		);
	},
};

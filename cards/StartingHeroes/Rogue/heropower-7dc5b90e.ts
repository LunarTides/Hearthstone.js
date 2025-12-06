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
	id: "7dc5b90e-3ef6-4b2c-a448-f4c5dffe9803",

	async heropower(self, owner) {
		// Equip a 1/2 Dagger.

		// Create the weapon card
		const weapon = await Card.create(
			game.cardIds.wickedKnife_ba638767_5692_419f_8032_7f481262db5a,
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
			game.cardIds.wickedKnife_ba638767_5692_419f_8032_7f481262db5a,
		);
	},
};

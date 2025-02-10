// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Dagger Mastery",
	text: "Equip a 1/2 Dagger.",
	cost: 2,
	type: "Heropower",
	classes: ["Rogue"],
	rarity: "Free",
	collectible: false,
	id: 122,

	async heropower(owner, self) {
		// Equip a 1/2 Dagger.

		// Create the weapon card
		const weapon = await Card.create(game.cardIds.wickedKnife22, owner);

		// Equip the weapon
		await owner.setWeapon(weapon);
	},

	async test(owner, self) {
		// The player should not have a weapon
		assert.equal(owner.weapon, undefined);
		await self.activate("heropower");

		// The player should now have the wicked knife weapon
		assert.ok(owner.weapon);
		assert.equal(owner.weapon.id, 22);
	},
};

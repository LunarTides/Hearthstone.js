// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Disable Heropower Test",
	text: "<i>Disable your hero power.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "669cfd42-b7e0-40e4-89a2-0964330931b4",

	attack: 1,
	health: 2,
	tribes: [Tribe.None],

	async tick(self, owner) {
		// Disable your hero power.

		owner.disableHeroPower(self.uuid);
	},

	async remove(self, owner) {
		owner.enableHeroPower(self.uuid);
	},

	async test(self, owner) {
		owner.mana = 10;

		// By default, you can use your hero power.
		assert(owner.canUseHeroPower());

		// When this card is on the board, you can't use your hero power.
		await owner.summon(self);
		assert(!owner.canUseHeroPower());

		// When this card dies, you can use your hero power.
		await self.destroy();
		assert(owner.canUseHeroPower());
	},
};

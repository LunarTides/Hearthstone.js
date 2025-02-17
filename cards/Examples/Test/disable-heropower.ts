// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Disable Heropower Test",
	text: "<i>Disable your hero power.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 136,

	attack: 1,
	health: 2,
	tribes: [MinionTribe.None],

	async tick(owner, self) {
		// Disable your hero power.

		owner.disableHeroPower = true;
	},

	async remove(owner, self) {
		owner.disableHeroPower = false;
	},

	async test(owner, self) {
		owner.mana = 10;

		// By default, you can use your hero power.
		assert(owner.canUseHeroPower());

		// When this card is on the board, you can't use your hero power.
		await owner.summon(self);
		assert(!owner.canUseHeroPower());

		// When this card dies, you can use your hero power.
		await self.kill();
		assert(owner.canUseHeroPower());
	},
};

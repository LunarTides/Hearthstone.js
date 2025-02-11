// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Disable Heropower Test",
	text: "<i>Disable your hero power.</i>",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 136,

	attack: 1,
	health: 2,
	tribe: "None",

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

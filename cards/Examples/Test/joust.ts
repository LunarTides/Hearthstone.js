// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Joust Test",
	text: "<b>Battlecry:</b> Reveal a minion from each player's deck. If yours costs more, gain +1/+1.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 139,

	attack: 1,
	health: 1,
	tribe: "None",

	async battlecry(owner, self) {
		// Reveal a minion from each player's deck. If yours costs more, gain +1/+1.

		// Joust. Only allow minion cards to be selected
		const win = await owner.joust((card) => card.type === "Minion");

		if (!win) {
			return;
		}

		await self.addStats(1, 1);
	},

	async test(owner, self) {
		// TODO: Test #325
		assert(true);
	},
};

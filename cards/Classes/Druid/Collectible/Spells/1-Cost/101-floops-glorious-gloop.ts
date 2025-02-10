// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Floop's Glorious Gloop",
	text: "Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.",
	cost: 1,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Legendary",
	collectible: true,
	id: 101,

	spellSchool: "Nature",

	async cast(owner, self) {
		// Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.
		const destroy = game.event.addListener(
			"KillCard",
			async () => {
				// Gain 1 Mana Crystal
				owner.refreshMana(1, owner.maxMana);

				return true;
			},
			-1,
		);

		game.event.addListener("EndTurn", async () => destroy());
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

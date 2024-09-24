// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Fury",
	text: "Summon a 2/1 Elemental with <b>Rush</b>.",
	cost: 2,
	type: "Heropower",
	classes: ["Shaman"],
	rarity: "Legendary",
	collectible: false,
	id: 126,

	async heropower(owner, self) {
		// Summon a 2/1 Elemental with Rush.
		const card = await Card.create(game.cardIds.windsweptElemental19, owner);
		if (!card) {
			return;
		}

		await owner.summon(card);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

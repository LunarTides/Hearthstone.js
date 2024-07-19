// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Chaotic Tendril",
	text: "<b>Battlecry:</b> Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Common",
	collectible: true,
	id: 110,

	attack: 1,
	health: 1,
	tribe: "None",

	battlecry(owner, self) {
		// Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.
		const pool = Card.all().filter(
			(card) => card.type === "Spell" && card.cost === 1,
		);

		const spell = game.lodash.sample(pool)?.imperfectCopy();

		if (spell) {
			spell.activate("cast");
		}

		// TODO: Improve your future Chaotic Tendrils
	},

	test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

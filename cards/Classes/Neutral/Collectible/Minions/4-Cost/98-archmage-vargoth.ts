// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Archmage Vargoth",
	text: "At the end of your turn, cast a spell you've cast this turn <i>(targets are random)</i>.",
	cost: 4,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Legendary",
	collectible: true,
	id: 98,

	attack: 2,
	health: 6,
	tribe: "None",

	async passive(owner, self, key, _unknownValue) {
		// At the end of your turn, cast a spell you've cast this turn (targets are random).

		// Only proceed if the correct event key was broadcast
		if (key !== "EndTurn") {
			return;
		}

		const spells: Card[] | undefined = game.event.events.PlayCard?.[owner.id]
			.filter(
				(object) =>
					object[0] instanceof Card &&
					object[0].type === "Spell" &&
					object[1] === game.turn,
			)
			.map((object) => object[0] as Card);

		if (!spells || spells.length <= 0) {
			return;
		}

		const spell = game.lodash.sample(spells);

		owner.forceTarget = game.functions.util.getRandomTarget();
		await spell?.activate("cast");
		owner.forceTarget = undefined;
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

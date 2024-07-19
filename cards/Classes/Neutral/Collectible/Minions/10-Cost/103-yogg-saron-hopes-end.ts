// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Yogg-Saron, Hope's End",
	text: "<b>Battlecry:</b> Cast a random spell for each spell you've cast this game <i>(targets chosen randomly)</i>.",
	cost: 10,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Legendary",
	collectible: true,
	id: 103,

	attack: 7,
	health: 5,
	tribe: "None",

	battlecry(owner, self) {
		// Cast a random spell for each spell you've cast this game (targets chosen randomly).
		const amount = game.event.events.PlayCard?.[owner.id].filter(
			(object) => object[0] instanceof Card && object[0].type === "Spell",
		).length;
		if (!amount) {
			return;
		}

		const pool = Card.all().filter((card) => card.type === "Spell");

		for (let i = 0; i < amount; i++) {
			const card = game.lodash.sample(pool)?.imperfectCopy();

			if (!card) {
				continue;
			}

			card.activate("cast");
		}
	},

	test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

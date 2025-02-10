// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Prison of Yogg-Saron",
	text: "Choose a character. Cast 4 random spells <i>(targeting it if possible)</i>.",
	cost: 7,
	type: "Location",
	classes: ["Neutral"],
	rarity: "Legendary",
	collectible: true,
	id: 102,

	durability: 3,
	cooldown: 2,

	async use(owner, self) {
		// Choose a character. Cast 4 random spells (targeting it if possible).
		const target = await game.functions.interact.promptTarget(
			self.text,
			self,
			"any",
			"any",
		);
		if (!target) {
			return Card.REFUND;
		}

		owner.forceTarget = target;

		const pool = (await Card.all()).filter((card) => card.type === "Spell");

		for (let i = 0; i < 4; i++) {
			const card = await game.lodash.sample(pool)?.imperfectCopy();
			if (!card) {
				continue;
			}

			await card.activate("cast");
		}

		owner.forceTarget = undefined;
		return true;
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

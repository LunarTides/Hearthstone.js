// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	type EventValue,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Yogg-Saron, Unleashed",
	text: "<b>Titan</b> After this uses an ability, cast two random spells.",
	cost: 9,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 106,

	attack: 7,
	health: 5,
	tribe: MinionTribe.None,

	async create(owner, self) {
		// Add additional fields here
		self.addKeyword(Keyword.Titan, [
			game.cardIds.induceInsanity107,
			game.cardIds.reignOfChaos108,
			game.cardIds.tentacleSwarm109,
		]);
	},

	async passive(owner, self, key, _unknownValue) {
		// After this uses an ability, cast two random spells

		// Only proceed if the correct event key was broadcast
		if (key !== "Titan") {
			return;
		}

		/*
		 * Here we cast the value to the correct type.
		 * Do not use the '_unknownValue' variable after this.
		 */
		const value = _unknownValue as EventValue<typeof key>;

		if (value[0] !== self) {
			return;
		}

		const pool = (await Card.all()).filter((card) => card.type === Type.Spell);

		for (let i = 0; i < 2; i++) {
			const card = await game.lodash.sample(pool)?.imperfectCopy();
			if (!card) {
				continue;
			}

			await card.activate(Ability.Cast);
		}
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

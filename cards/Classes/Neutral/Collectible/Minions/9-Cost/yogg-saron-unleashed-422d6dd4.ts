// Created by the Vanilla Card Creator

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Keyword,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Yogg-Saron, Unleashed",
	text: "<b>Titan</b> After this uses an ability, cast two random spells.",
	cost: 9,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-7007-8ed1-422d6dd4a646",

	attack: 7,
	health: 5,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Titan, [
			game.cardIds.induceInsanity_019bc665_4f82_7016_b55e_04654406a57d,
			game.cardIds.reignOfChaos_019bc665_4f82_7015_a844_383b783e6f58,
			game.cardIds.tentacleSwarm_019bc665_4f82_7017_912f_291d65cf901d,
		]);
	},

	async passive(self, owner, key, value) {
		// After this uses an ability, cast two random spells

		// Only proceed if the correct event key was broadcast
		if (!game.event.is(key, value, Event.Titan)) {
			return;
		}

		if (value[0] !== self) {
			return;
		}

		const pool = (await Card.all()).filter((card) => card.type === Type.Spell);

		for (let i = 0; i < 2; i++) {
			const card = await game.lodash.sample(pool)?.imperfectCopy();
			if (!card) {
				continue;
			}

			await card.trigger(Ability.Cast);
		}
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

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
	id: "25ae4928-8e9b-434f-842a-2259070dcee6",

	attack: 7,
	health: 5,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Add additional fields here
		self.addKeyword(Keyword.Titan, [
			game.cardIds.induceInsanity_961ce6f6_2963_4ee1_8e25_64a06c9ca714,
			game.cardIds.reignOfChaos_2ef76c34_54ca_43ca_bde2_15450178fe89,
			game.cardIds.tentacleSwarm_7816c1c2_46ae_451a_87f9_188707a722f2,
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

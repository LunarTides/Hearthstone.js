// Created by the Vanilla Card Creator

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Yogg-Saron, Hope's End",
	text: "<b>Battlecry:</b> Cast a random spell for each spell you've cast this game <i>(targets chosen randomly)</i>.",
	cost: 10,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 103,

	attack: 7,
	health: 5,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Cast a random spell for each spell you've cast this game (targets chosen randomly).
		const amount = owner
			.getPlayedCards()
			.filter((card) => card.type === Type.Spell).length;
		if (!amount) {
			return;
		}

		const pool = (await Card.all()).filter((card) => card.type === Type.Spell);

		for (let i = 0; i < amount; i++) {
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

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
	name: "Chaotic Tendril",
	text: "<b>Battlecry:</b> Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-7009-a883-cefc7053b9d8",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Cast a random 1-Cost spell. Improve your future Chaotic Tendrils.
		const pool = (await Card.all()).filter(
			(card) => card.type === Type.Spell && card.cost === 1,
		);

		const spell = await game.lodash.sample(pool)?.imperfectCopy();

		if (spell) {
			await spell.trigger(Ability.Cast);
		}

		// TODO: Improve your future Chaotic Tendrils. #372
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

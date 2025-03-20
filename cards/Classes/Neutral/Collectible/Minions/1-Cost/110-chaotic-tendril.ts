// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	EventListenerMessage,
	MinionTribe,
	Rarity,
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
	id: 110,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
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

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

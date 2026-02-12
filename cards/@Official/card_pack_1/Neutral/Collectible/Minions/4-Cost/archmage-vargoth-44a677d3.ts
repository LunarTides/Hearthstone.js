// Created by the Vanilla Card Creator

import type { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Archmage Vargoth",
	text: "At the end of your turn, cast a spell you've cast this turn <i>(targets are random)</i>.",
	cost: 4,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-701c-a49f-44a677d33377",

	attack: 2,
	health: 6,
	tribes: [Tribe.None],

	async passive(self, owner, key, value) {
		// At the end of your turn, cast a spell you've cast this turn (targets are random).

		// Only proceed if the correct event key was broadcast
		if (!game.event.is(key, value, Event.EndTurn)) {
			return;
		}

		const spells: Card[] | undefined = owner
			.getPlayedCards()
			.filter(
				(card) => card.type === Type.Spell && card.turnPlayed === game.turn,
			);
		if (!spells || spells.length <= 0) {
			return;
		}

		const spell = game.lodash.sample(spells);

		owner.forceTarget = game.functions.util.getRandomTarget();
		await spell?.trigger(Ability.Cast);
		owner.forceTarget = undefined;
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

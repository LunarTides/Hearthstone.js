// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Archmage Vargoth",
	text: "At the end of your turn, cast a spell you've cast this turn <i>(targets are random)</i>.",
	cost: 4,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 98,

	attack: 2,
	health: 6,
	tribes: [MinionTribe.None],

	async passive(owner, self, key, value) {
		// At the end of your turn, cast a spell you've cast this turn (targets are random).

		// Only proceed if the correct event key was broadcast
		if (!game.event.is(key, value, Event.EndTurn)) {
			return;
		}

		const spells: Card[] | undefined = game.event.events.PlayCard?.[owner.id]
			.filter(
				(object) => object[0].type === Type.Spell && object[1] === game.turn,
			)
			.map((object) => object[0] as Card);

		if (!spells || spells.length <= 0) {
			return;
		}

		const spell = game.lodash.sample(spells);

		owner.forceTarget = game.functions.util.getRandomTarget();
		await spell?.activate(Ability.Cast);
		owner.forceTarget = undefined;
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

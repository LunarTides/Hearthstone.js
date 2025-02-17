// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Floop's Glorious Gloop",
	text: "Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 101,

	spellSchool: SpellSchool.Nature,

	async cast(owner, self) {
		// Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.
		const destroy = game.event.addListener(
			Event.KillCard,
			async () => {
				// Gain 1 Mana Crystal
				owner.refreshMana(1, owner.maxMana);

				return EventListenerMessage.Success;
			},
			-1,
		);

		game.event.addListener(Event.EndTurn, async () => {
			destroy();

			return EventListenerMessage.Destroy;
		});
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

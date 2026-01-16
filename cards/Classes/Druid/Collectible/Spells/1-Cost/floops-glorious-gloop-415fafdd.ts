// Created by the Vanilla Card Creator

import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Floop's Glorious Gloop",
	text: "Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-7010-bc9a-415fafddfcb3",

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.
		const destroy = game.event.addListener(
			Event.DestroyCard,
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

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};

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
	name: "Moonlit Guidance",
	text: "<b>Discover</b> a copy of a card in your deck. If you play it this turn, draw the original.",
	cost: 2,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: "79e4efb4-ebd5-4ee8-911d-e25735e98149",

	spellSchools: [SpellSchool.Arcane],

	async cast(self, owner) {
		// Discover a copy of a card in your deck. If you play it this turn, draw the original.
		const original = await game.prompt.discover(self.text, owner.deck, false);
		if (!original) {
			return;
		}

		const card = await original.imperfectCopy();
		await owner.addToHand(card);

		// Wait for the player to play the card
		const destroy = game.event.addListener(
			Event.PlayCard,
			async (value, eventPlayer) => {
				if (value !== card) {
					return EventListenerMessage.Skip;
				}

				await owner.drawSpecific(original);
				return EventListenerMessage.Success;
			},
		);

		// Destroy the event listener when the turn ends
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

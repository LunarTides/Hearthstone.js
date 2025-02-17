// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	type EventValue,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Moonlit Guidance",
	text: "<b>Discover</b> a copy of a card in your deck. If you play it this turn, draw the original.",
	cost: 2,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: 90,

	spellSchools: [SpellSchool.Arcane],

	async cast(owner, self) {
		// Discover a copy of a card in your deck. If you play it this turn, draw the original.
		const original = await game.functions.interact.prompt.discover(
			self.text,
			owner.deck,
			false,
		);
		if (!original) {
			return;
		}

		const card = await original.imperfectCopy();
		await owner.addToHand(card);

		// Wait for the player to play the card
		const destroy = game.event.addListener(
			Event.PlayCard,
			async (_unknownValue, eventPlayer) => {
				const value = _unknownValue as EventValue<Event.PlayCard>;

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

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

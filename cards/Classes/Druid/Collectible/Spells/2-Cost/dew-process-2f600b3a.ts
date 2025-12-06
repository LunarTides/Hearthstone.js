// Created by the Vanilla Card Creator

import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Dew Process",
	text: "For the rest of the game, players draw an extra card at the start of their turn.",
	cost: 2,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: "2f600b3a-d198-4d21-bc70-7dd77c9302df",

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// For the rest of the game, players draw an extra card at the start of their turn.
		game.event.addListener(
			Event.StartTurn,
			async (value, eventPlayer) => {
				await eventPlayer.drawCards(1);
				return EventListenerMessage.Success;
			},
			-1,
		);
	},

	async test(self, owner) {
		let handSize = owner.hand.length;

		// When the card hasn't been played, draw 1 card every turn.
		await game.endTurn();
		await game.endTurn();

		// Increment handSize by 1 so that we can do handSize + 2
		assert.equal(owner.hand.length, ++handSize);

		await self.trigger(Ability.Cast);

		await game.endTurn();
		await game.endTurn();

		assert.equal(owner.hand.length, handSize + 2);
	},
};

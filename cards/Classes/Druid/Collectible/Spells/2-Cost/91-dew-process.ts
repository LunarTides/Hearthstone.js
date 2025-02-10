// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Dew Process",
	text: "For the rest of the game, players draw an extra card at the start of their turn.",
	cost: 2,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	id: 91,

	spellSchool: "Nature",

	async cast(owner, self) {
		// For the rest of the game, players draw an extra card at the start of their turn.
		game.event.addListener(
			"StartTurn",
			async (_unknownValue, eventPlayer) => {
				await eventPlayer.drawCards(1);
				return true;
			},
			-1,
		);
	},

	async test(owner, self) {
		let handSize = owner.hand.length;

		// When the card hasn't been played, draw 1 card every turn.
		await game.endTurn();
		await game.endTurn();

		// Increment handSize by 1 so that we can do handSize + 2
		assert.equal(owner.hand.length, ++handSize);

		await self.activate("cast");

		await game.endTurn();
		await game.endTurn();

		assert.equal(owner.hand.length, handSize + 2);
	},
};

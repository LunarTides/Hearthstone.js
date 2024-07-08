// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Aquatic Form",
	text: "<b>Dredge</b>. If you have the Mana to play the card this turn, draw it.",
	cost: 0,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	id: 93,

	spellSchool: "None",

	cast(owner, self) {
		// Dredge. If you have the Mana to play the card this turn, draw it.
		const card = game.interact.card.dredge();
		if (!card || owner.mana < card.cost) {
			return;
		}

		owner.drawCards(1);
	},

	test(owner, self) {
		const handSize = owner.hand.length;

		// Make the player answer 1
		owner.inputQueue = "1";

		// Shouldn't draw any cards
		owner.mana = -1;

		self.activate("cast");
		assert.equal(owner.hand.length, handSize);

		// Should draw a card
		owner.mana = 10;

		self.activate("cast");
		assert.equal(owner.hand.length, handSize + 1);
	},
};

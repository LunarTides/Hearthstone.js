// Created by the Vanilla Card Creator

import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Aquatic Form",
	text: "<b>Dredge</b>. If you have the Mana to play the card this turn, draw it.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: 93,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Dredge. If you have the Mana to play the card this turn, draw it.
		const card = await game.functions.interact.prompt.dredge();
		if (!card || owner.mana < card.cost) {
			return;
		}

		await owner.drawCards(1);
	},

	async test(self, owner) {
		const handSize = owner.hand.length;

		// Make the player answer 1
		owner.inputQueue = "1";

		// Shouldn't draw any cards
		owner.mana = -1;

		await self.trigger(Ability.Cast);
		assert.equal(owner.hand.length, handSize);

		// Should draw a card
		owner.mana = 10;

		await self.trigger(Ability.Cast);
		assert.equal(owner.hand.length, handSize + 1);
	},
};

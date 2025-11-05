// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Invigorate",
	text: "<b>Choose One -</b> Gain an empty Mana Crystal; or Draw a card.",
	cost: 2,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: 92,

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Choose One - Gain an empty Mana Crystal; or Draw a card.
		await game.functions.interact.prompt.chooseOne(
			1,
			[
				"Gain an empty Mana Crystal",
				async () => {
					// Gain an empty Mana Crystal
					owner.addEmptyMana(1);
				},
			],
			[
				"Draw a card",
				async () => {
					// Draw a card
					await owner.drawCards(1);
				},
			],
		);
	},

	async test(self, owner) {
		// Gain an empty Mana Crystal
		const { emptyMana } = owner;

		owner.inputQueue = ["1"];
		await self.trigger(Ability.Cast);

		assert.equal(owner.emptyMana, emptyMana + 1);

		// Draw a card
		const handSize = owner.hand.length;

		owner.inputQueue = ["2"];
		await self.trigger(Ability.Cast);

		assert.equal(owner.hand.length, handSize + 1);
	},
};

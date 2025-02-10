// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Invigorate",
	text: "<b>Choose One -</b> Gain an empty Mana Crystal; or Draw a card.",
	cost: 2,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	id: 92,

	spellSchool: "Nature",

	async cast(owner, self) {
		// Choose One - Gain an empty Mana Crystal; or Draw a card.
		await game.interact.promptChooseOne(
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

	async test(owner, self) {
		// Gain an empty Mana Crystal
		const { emptyMana } = owner;

		owner.inputQueue = ["1"];
		await self.activate("cast");

		assert.equal(owner.emptyMana, emptyMana + 1);

		// Draw a card
		const handSize = owner.hand.length;

		owner.inputQueue = ["2"];
		await self.activate("cast");

		assert.equal(owner.hand.length, handSize + 1);
	},
};

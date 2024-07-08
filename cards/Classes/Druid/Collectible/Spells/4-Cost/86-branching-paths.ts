// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Branching Paths",
	text: "<b>Choose Twice -</b> Draw a card; Give your minions +1 Attack; Gain 6 Armor.",
	cost: 4,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Epic",
	collectible: true,
	id: 86,

	spellSchool: "None",

	cast(owner, self) {
		// Choose Twice - Draw a card; Give your minions +1 Attack; Gain 6 Armor.
		game.interact.chooseOne(
			2,
			[
				"Draw a card",
				() => {
					// Draw a card
					owner.drawCards(1);
				},
			],
			[
				"Give your minions +1 Attack",
				() => {
					// Give your minions +1 Attack
					for (const card of owner.board) {
						if (card.attack) {
							card.attack += 1;
						}
					}
				},
			],
			[
				"Gain 6 Armor",
				() => {
					// Gain 6 Armor
					owner.addArmor(6);
				},
			],
		);
	},

	test(owner, self) {
		// Summon a Sheep
		const sheep = new Card(game.cardIds.sheep1, owner);
		owner.summon(sheep);

		const handSize = owner.hand.length;

		// Test 'Draw a Card', and 'Give your minions +1 Attack'.
		owner.inputQueue = ["1", "2"];
		self.activate("cast");

		assert.equal(owner.hand.length, handSize + 1);
		assert.equal(sheep.attack, 2);

		// Test '+1 Attack', and 'Gain 6 Armor'.
		owner.inputQueue = ["2", "3"];
		self.activate("cast");

		assert.equal(sheep.attack, 3);
		assert.equal(owner.armor, 6);
	},
};

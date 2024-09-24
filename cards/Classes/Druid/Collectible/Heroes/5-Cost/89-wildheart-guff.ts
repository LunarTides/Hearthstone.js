// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Wildheart Guff",
	text: "<b>Battlecry:</b> Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.",
	cost: 5,
	type: "Hero",
	classes: ["Druid"],
	rarity: "Legendary",
	collectible: true,
	id: 89,

	armor: 5,
	heropowerId: 113,

	async battlecry(owner, self) {
		// Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.
		owner.maxMana = 20;
		owner.addEmptyMana(1);
		await owner.drawCards(1);
	},

	async test(owner, self) {
		const handSize = owner.hand.length;
		const { emptyMana } = owner;

		// Update if changing the default max mana.
		assert.equal(owner.maxMana, 10);

		await self.activate("battlecry");

		assert.equal(owner.maxMana, 20);
		assert.equal(owner.emptyMana, emptyMana + 1);
		assert.equal(owner.hand.length, handSize + 1);
	},
};

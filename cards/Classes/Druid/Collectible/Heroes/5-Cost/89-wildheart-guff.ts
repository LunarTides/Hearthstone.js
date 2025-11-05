// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Wildheart Guff",
	text: "<b>Battlecry:</b> Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.",
	cost: 5,
	type: Type.Hero,
	classes: [Class.Druid],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 89,

	armor: 5,
	heropowerId: game.cardIds.nurture_113,

	async battlecry(self, owner) {
		// Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.
		owner.maxMana = 20;
		owner.addEmptyMana(1);
		await owner.drawCards(1);
	},

	async test(self, owner) {
		const handSize = owner.hand.length;
		const { emptyMana } = owner;

		// Update if changing the default max mana.
		assert.equal(owner.maxMana, 10);

		await self.trigger(Ability.Battlecry);

		assert.equal(owner.maxMana, 20);
		assert.equal(owner.emptyMana, emptyMana + 1);
		assert.equal(owner.hand.length, handSize + 1);
	},
};

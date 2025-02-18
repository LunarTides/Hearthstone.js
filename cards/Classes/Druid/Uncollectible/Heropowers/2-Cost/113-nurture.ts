// Created by the Custom Card Creator

import assert from "node:assert";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Nurture",
	text: "<b>Choose One -</b> Draw a card; or Gain an empty Mana Crystal.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 113,

	async heropower(owner, self) {
		// Choose One - Draw a card; or Gain an empty Mana Crystal.
		await game.functions.interact.prompt.chooseOne(
			1,
			[
				"Draw a card",
				async () => {
					// Draw a card
					await owner.drawCards(1);
				},
			],
			[
				"Gain an empty Mana Crystal",
				async () => {
					// Gain an empty ManaCrystal
					owner.addEmptyMana(1);
				},
			],
		);
	},

	async test(owner, self) {
		// Draw a card
		const handSize = owner.hand.length;

		owner.inputQueue = ["1"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.hand.length, handSize + 1);

		// Gain an empty Mana Crystal
		const { emptyMana } = owner;

		owner.inputQueue = ["2"];
		await self.trigger(Ability.HeroPower);

		assert.equal(owner.emptyMana, emptyMana + 1);
	},
};

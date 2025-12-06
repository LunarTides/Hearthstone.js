// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Reinforce",
	text: "Summon a 1/1 Silver Hand Recruit.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "454f8520-900b-4933-adf0-5188ac6eaed2",

	async heropower(self, owner) {
		// Summon a 1/1 Silver Hand Recruit.

		// Create the Silver Hand Recruit card.
		const card = await Card.create(
			game.cardIds.silverHandRecruit_a3de4f06_e9b8_49c3_b9c8_0950da4b85e4,
			owner,
		);

		// Summon the card
		await owner.summon(card);
	},

	async test(self, owner) {
		const checkIfMinionExists = () =>
			owner.board.some(
				(card) =>
					card.id ===
					game.cardIds.silverHandRecruit_a3de4f06_e9b8_49c3_b9c8_0950da4b85e4,
			);

		// The minion should not exist
		assert(!checkIfMinionExists());
		await self.trigger(Ability.HeroPower);

		// The minion should now exist
		assert(checkIfMinionExists());
	},
};

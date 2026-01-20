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
	id: "019bc665-4f81-701e-9b97-cfefb8e48128",

	async heropower(self, owner) {
		// Summon a 1/1 Silver Hand Recruit.

		// Create the Silver Hand Recruit card.
		const card = await Card.create(
			game.cardIds.silverHandRecruit_019bc665_4f81_701c_bbae_d8d57613e566,
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
					game.cardIds.silverHandRecruit_019bc665_4f81_701c_bbae_d8d57613e566,
			);

		// The minion should not exist
		assert(!checkIfMinionExists());
		await self.trigger(Ability.HeroPower);

		// The minion should now exist
		assert(checkIfMinionExists());
	},
};

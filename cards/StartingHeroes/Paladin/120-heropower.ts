// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Reinforce",
	text: "Summon a 1/1 Silver Hand Recruit.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 120,

	async heropower(owner, self) {
		// Summon a 1/1 Silver Hand Recruit.

		// Create the Silver Hand Recruit card.
		const card = await Card.create(game.cardIds.silverHandRecruit20, owner);

		// Summon the card
		await owner.summon(card);
	},

	async test(owner, self) {
		const checkIfMinionExists = () =>
			owner.board.some((card) => card.id === 20);

		// The minion should not exist
		assert(!checkIfMinionExists());
		await self.activate(Ability.HeroPower);

		// The minion should now exist
		assert(checkIfMinionExists());
	},
};

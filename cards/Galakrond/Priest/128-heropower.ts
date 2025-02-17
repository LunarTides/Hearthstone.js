// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import { type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Galakrond's Wit",
	text: "Add a random Priest minion to your hand.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Priest],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: 128,

	async heropower(owner, self) {
		// Add a random Priest minion to your hand.
		const possibleCards = (await Card.all()).filter(
			(c) =>
				c.type === Type.Minion &&
				game.functions.card.validateClasses(c.classes, Class.Priest),
		);

		if (possibleCards.length <= 0) {
			return;
		}

		let card = game.lodash.sample(possibleCards);
		if (!card) {
			return;
		}

		card = await Card.create(card.id, owner);

		await owner.addToHand(card);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

// Created by the Custom Card Creator

import assert from "node:assert";
import { Card, CardError } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	CardTag,
	Class,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Totemic Call",
	text: "Summon a random basic Totem.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 119,

	async heropower(owner, self) {
		// Filter away totem cards that is already on the player's side of the board.
		const filteredTotemCards = (await Card.allWithTags([CardTag.Totem])).filter(
			(card) => !owner.board.some((c) => c.id === card.id),
		);

		// If there are no totem cards to summon, refund the hero power, which gives the player back their mana
		if (filteredTotemCards.length === 0) {
			return Card.REFUND;
		}

		// Randomly choose one of the totem cards.
		const card = game.lodash.sample(filteredTotemCards);
		if (!card) {
			throw new CardError("null found when randomly choosing totem card name");
		}

		// Summon the card on the player's side of the board
		await owner.summon(await card.imperfectCopy());
		return true;
	},

	async test(owner, self) {
		const totemCards = await Card.allWithTags([CardTag.Totem]);
		const checkForTotemCard = (amount: number) =>
			owner.board.filter((card) =>
				totemCards.map((c) => c.id).includes(card.id),
			).length === amount;

		// There should be 0 totem cards on the board
		assert(checkForTotemCard(0));

		for (let index = 1; index <= totemCards.length + 1; index++) {
			await self.trigger(Ability.HeroPower);

			// If all totem cards are on the board, it shouldn't summon a new one
			if (index > totemCards.length) {
				assert(checkForTotemCard(index - 1));
				continue;
			}

			// There should be 'index' totem cards on the board
			assert(checkForTotemCard(index));
		}

		// Assert that all of the totem cards are on the board
		for (const card of totemCards) {
			assert(owner.board.some((c) => c.id === card.id));
		}

		// Assert that the board's length is equal to the amount of totem cards.
		assert.equal(owner.board.length, totemCards.length);
	},
};

// Created by the Custom Card Creator

import assert from "node:assert";
import { Card, CardError } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Totemic Call",
	text: "Summon a random basic Totem.",
	cost: 2,
	type: "Heropower",
	classes: ["Shaman"],
	rarity: "Free",
	collectible: false,
	id: 119,

	heropower(owner, self) {
		// Filter away totem cards that is already on the player's side of the board.
		const filteredTotemCardNames = game.cardCollections.totems.filter(
			(id) => !owner.board.some((m) => m.id === id),
		);

		// If there are no totem cards to summon, refund the hero power, which gives the player back their mana
		if (filteredTotemCardNames.length === 0) {
			return Card.REFUND;
		}

		// Randomly choose one of the totem cards.
		const cardName = game.lodash.sample(filteredTotemCardNames);
		if (!cardName) {
			throw new CardError("null found when randomly choosing totem card name");
		}

		// Create a card from the name.
		const card = new Card(cardName, owner);

		// Summon the card on the player's side of the board
		owner.summon(card);
		return true;
	},

	test(owner, self) {
		const totemCardIds = game.cardCollections.totems;
		const checkForTotemCard = (amount: number) =>
			owner.board.filter((card) => totemCardIds.includes(card.id)).length ===
			amount;

		// There should be 0 totem cards on the board
		assert(checkForTotemCard(0));

		for (let index = 1; index <= totemCardIds.length + 1; index++) {
			self.activate("heropower");

			// If all totem cards are on the board, it shouldn't summon a new one
			if (index > totemCardIds.length) {
				assert(checkForTotemCard(index - 1));
				continue;
			}

			// There should be 'index' totem cards on the board
			assert(checkForTotemCard(index));
		}

		// Assert that all of the totem cards are on the board
		for (const id of totemCardIds) {
			assert(owner.board.some((card) => card.id === id));
		}

		// Assert that the board's length is equal to the amount of totem cards.
		assert.equal(owner.board.length, totemCardIds.length);
	},
};

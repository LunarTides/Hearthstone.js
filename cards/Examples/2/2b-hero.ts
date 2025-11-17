// Created by Hand

import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Hero Example",
	text: "<b>Battlecry:</b> Restore your hero to full health.",
	cost: 1,

	// Remember to use the correct type.
	type: Type.Hero,

	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 37,

	// The amount of armor that the player will gain when playing this card.
	armor: 5,

	/*
	 * The id of the hero power card. Here we use the `2-heropower.ts` card.
	 *
	 * The `game.cardIds` object contains the ids of every card in the game.
	 * It exists because doing `heropowerId: 130` is not very readable.
	 * The `game.cardIds` representation of the card is its name, followed by its id.
	 *
	 * The `cardIds` object will be refreshed when you run the game.
	 * So if you get an error here, try launching the game and see if it fixes it.
	 */
	heropowerId: game.cardIds.heropowerExample_130,

	async battlecry(self, owner) {
		// Restore your hero to full health.

		/*
		 * Heal this card's owner to full health.
		 * The `addHealth` method automatically caps the health of the player, so you don't need to worry.
		 * Don't manually set `owner.health`.
		 */
		owner.addHealth(owner.maxHealth);
	},

	async test(self, owner) {
		owner.health = 1;
		await self.trigger(Ability.Battlecry);
		assert.equal(owner.health, owner.maxHealth);
	},
};

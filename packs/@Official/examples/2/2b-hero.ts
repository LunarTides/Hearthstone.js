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
	id: "019bc665-4f80-7027-90e8-3a6807c623b1",

	// The amount of armor that the player will gain when playing this card.
	armor: 5,

	/*
	 * The id of the hero power card. Here we use the `2-heropower.ts` card.
	 *
	 * The `game.ids` object contains the ids of every card in the game.
	 * It exists because doing `heropowerId: "019bc665_4f80_7026_b3ab_aa5a664f5024"` is not very readable.
	 * Autocomplete is very helpful here.
	 *
	 * This is an array incase there are multiple cards with the same name.
	 *
	 * If you don't know which pack a card belongs to, you can use `game.ids.all`.
	 * The `game.ids.all` representation of the card is its name, followed by its id.
	 *
	 * The `ids` object will be refreshed when you run the game.
	 * So if you get an error here, try relaunching the game and see if it fixes it.
	 */
	heropowerId: game.ids.Official.examples.heropower_example[0],

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

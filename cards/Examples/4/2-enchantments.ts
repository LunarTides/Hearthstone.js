// Created by Hand

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Enchantment Example",
	text: "Your cards cost 1 less.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 56,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	/*
	 * `tick` works the same as passive, except it's called more often, and isn't dependent on events.
	 * More on ticks in '4-5'
	 */
	async tick(owner, self, key, value) {
		// Your cards cost 1 less.

		/*
		 * When changing cost of a card USE THE ENCHANTMENT SYSTEM. This will ensure that mutliple cards can change the cost of cards without interfering with each other.
		 * We don't care about the event, we just want to run this code every now and then.
		 */

		for (const card of owner.hand) {
			// If the card was already given the "-1 cost" enchantment from this card, ignore it
			if (card.enchantmentExists("-1 cost", self)) {
				continue;
			}

			// Give the card the "-1 cost" enchantment.
			card.addEnchantment("-1 cost", self);

			// You can also give "+x cost", or "cost = x" enchantments
		}
	},

	/*
	 * This ability triggers whenever this card is about to be removed from the game.
	 * It exists to allow cards to undo changes made by `passive`-related effects (e.g. tick).
	 */
	async remove(owner, self) {
		// Remove the "-1 cost" enchantments that was given by this card from all cards in the player's hand.

		for (const card of owner.hand) {
			// Only remove the "-1 cost" enchantment given by this card.
			card.removeEnchantment("-1 cost", self);
		}
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

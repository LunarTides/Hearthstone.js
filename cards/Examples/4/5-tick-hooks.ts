// Created by Hand

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Tick Hook Example",
	text: "Your cards cost (1) less.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 59,

	attack: 1,
	health: 1,
	tribe: "None",

	async create(owner, self) {
		// Initialize storage
		self.storage.unhooks = [];
	},

	async battlecry(owner, self) {
		// Your cards cost (1) less.

		/*
		 * Ticks are called more often than passives.
		 * Passives get called when an event gets broadcast, ticks get called when an event gets broadcast AND every game loop.
		 * So ticks might be better to use in some situations where you don't want it to be dependent on events (events can be suppressed),
		 * or you want it to be triggered every game loop no matter what.
		 */

		/*
		 * This returns a function that, when called, will remove the hook.
		 * You are given the key and value of the event.
		 * I don't think you will need them for tick hooks, since they are not supposed to be dependent on events, but you are free to use them if you want.
		 */
		const unhook = game.functions.event.hookToTick(
			async (key, _unknownValue) => {
				for (const card of owner.hand) {
					if (card.enchantmentExists("-1 cost", self)) {
						continue;
					}

					card.addEnchantment("-1 cost", self);
				}
			},
		);

		/*
		 * Store the unhook to be used later in the `remove` ability. This is the only supported way to transfer information between abilities.
		 * You can store anything in a card, and it shouldn't be messed with by other cards / the game.
		 * Speaking of, you should never mess with another card's storage since it can cause unexpected behavior.
		 */
		self.storage.unhooks.push(unhook);
	},

	// Unhook from the tick when the card is removed
	async remove(owner, self) {
		/*
		 * TODO: Change this example card to use a better example. I'm sure there is a card that uses tick hooks in a better way that we can copy.
		 * This is a bad example, since this is what the `tick` ability is supposed to do anyway.
		 */

		/*
		 * Unhook from all ticks that the card is hooked to.
		 * It is important to unhook before removing the enchantments, since removing the enchantments could possibly cause a tick, which would add the enchantments back.
		 */
		if (Array.isArray(self.storage.unhooks)) {
			for (const unhook of self.storage.unhooks) {
				(unhook as () => void)();
			}
		}

		// Undo the enchantments
		for (const card of owner.hand) {
			card.removeEnchantment("-1 cost", self);
		}
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};

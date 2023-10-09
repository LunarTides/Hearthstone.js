// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Enchantment Example",
    stats: [1, 1],
    text: "Your cards cost 1 less.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 56,

    // `tick` works the same as passive, except it's called more often, and isn't dependent on events.
    // More on ticks in '4-5'
    tick(plr, self, key, val) {
        // Your cards cost 1 less.

        // When changing cost of a card USE THE ENCHANTMENT SYSTEM.
        // We don't care about the event, we just want to run this code every now and then.

        plr.hand.forEach(c => {
            // If the card was already given the "-1 cost" enchantment from this card, ignore it
            if (c.enchantmentExists("-1 cost", self)) return;

            // Give the card the "-1 cost" enchantment.
            c.addEnchantment("-1 cost", self);

            // You can also give the "+x cost", or "cost = x" enchantments, where x is any number.
        });
    },

    // This "ability" triggers whenever this card is about to be removed from the game.
    // It exists to allow cards to undo changes made by `passive`-related effects (e.g. tick).
    remove(plr, self) {
        // Remove the "-1 cost" enchantments that was given by this card from all cards in the player's hand.

        plr.hand.forEach(c => {
            // Only remove the "-1 cost" enchantment given by this card.
            c.removeEnchantment("-1 cost", self);
        });
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    }
}

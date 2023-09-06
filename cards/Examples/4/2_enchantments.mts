// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Enchantment Example",
    stats: [1, 1],
    desc: "Your cards cost 1 less.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 57,

    // TODO: Add a `tick` ability for this purpose.
    passive(plr, game, self, key, val) {
        // When changing cost of a card USE THE ENCHANTMENT SYSTEM.
        // We don't care about the event, we just want to run this code every now and then.

        plr.hand.forEach(c => {
            // If the card was already given the "-1 mana" enchantment from this card, ignore it
            if (c.enchantmentExists("-1 mana", self)) return;

            // Give the card the "-1 mana" enchantment.
            c.addEnchantment("-1 mana", self);
        });
    },

    // This function triggers whenever this card is about to be removed from the game.
    // It exists to allow cards to undo changes made by `passive`.
    remove(plr, game, self) {
        // Remove the "-1 mana" enchantments that was given by this card from all cards in the player's hand.

        plr.hand.forEach(c => {
            // Only remove the "-1 mana" enchantment given by this card.
            c.removeEnchantment("-1 mana", self);
        });
    }
}

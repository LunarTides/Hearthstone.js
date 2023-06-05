// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Enchantment Example",
    stats: [1, 1],
    desc: "Your cards cost 1 less.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        // When changing cost of a card USE THE ENCHANTMENT SYSTEM.
        // We don't care about the event, we just want to run this code every now and then.

        plr.hand.forEach(c => {
            // If the card was already given the "-1 mana" enchantment from this card.
            if (c.enchantmentExists("-1 mana", self)) return;

            c.addEnchantment("-1 mana", self);
        });
    },

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    unpassive(plr, game, self, ignore) {
        // This happens before `passive` every time.
        // If `ignore` is false, it means this minions is either:
        // a. About to die
        // b. About to be silenced
        //
        // Either way, we want to remove the enchantment.
        if (ignore) return;

        plr.hand.forEach(c => {
            // Only remove the "-1 mana" enchantment given by this card.
            c.removeEnchantment("-1 mana", self);
        });
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Generous Mummy",
    stats: [5, 4],
    desc: "Reborn. Your opponent's cards cost (1) less.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Saviors of Uldum",
    keywords: ["Reborn"],
    id: 45,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // Ticks are called more often than passives
        let unhook = game.functions.hookToTick(() => {
            plr.getOpponent().hand.forEach(c => {
                if (c.enchantmentExists("-1 mana", self)) return;

                c.addEnchantment("-1 mana", self);
            });
        });

        // Store the unhook to be used later
        self.storage.push(unhook);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    unpassive(plr, game, self, ignore) {
        if (ignore) return;

        // Unhook from the tick
        if (self.storage.length >= 0) (self.storage[0]());

        // If it gets to this point, this card is either about to be silenced, or killed.
        plr.getOpponent().hand.forEach(c => {
            c.removeEnchantment("-1 mana", self);
        });
    }
}

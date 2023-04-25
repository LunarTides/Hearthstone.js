module.exports = {
    name: "Generous Mummy",
    stats: [5, 4],
    desc: "Reborn. Your opponent's cards cost (1) less.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Saviors of Uldum",
    keywords: ["Reborn"],
    id: 45,

    passive(plr, game, self, key, val) {
        if (key == "KillMinion" && val == self) return;

        plr.getOpponent().hand.forEach(c => {
            if (!c.enchantmentExists("-1 mana", self)) c.addEnchantment("-1 mana", self);
        });
    },

    unpassive(plr, game, self, ignore) {
        if (ignore) return;

        // If it gets to this point, this card is either about to be silenced, or killed.
        plr.getOpponent().hand.forEach(c => {
            c.removeEnchantment("-1 mana", self);
        });
    }
}

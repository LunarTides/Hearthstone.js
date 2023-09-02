module.exports = {
    name: "Enchantment Test",
    stats: [1, 1],
    desc: "Your cards cost 1 less.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    passive(plr, game, self, key, val) {
        let enchantment = "-1 mana";

        plr.hand.forEach(c => {
            if (!c.enchantmentExists(enchantment, self)) c.addEnchantment(enchantment, self);
        });
    },

    remove(plr, game, self) {
        plr.hand.forEach(c => {
            c.removeEnchantment("-1 mana", self);
        });
    }
}

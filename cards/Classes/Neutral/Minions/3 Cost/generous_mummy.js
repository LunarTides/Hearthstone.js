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

    passive(plr, game, card, key, val) {
        plr.getOpponent().hand.forEach(c => {
            if (!c.enchantmentExists("-1 mana", card)) c.addEnchantment("-1 mana", card);
        });
    }
}

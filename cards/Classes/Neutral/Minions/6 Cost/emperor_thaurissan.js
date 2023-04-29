module.exports = {
    name: "Emperor Thaurissan",
    stats: [5, 5],
    desc: "At the end of your turn, reduce the Cost of cards in your hand by (1).",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Blackrock Mountain",
    id: 52,

    endofturn(plr, game, card) {
        plr.hand.forEach(c => {
            c.addEnchantment("-1 mana", card);
        });
    }
}

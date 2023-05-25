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

    passive(plr, game, card, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        plr.hand.forEach(c => {
            c.addEnchantment("-1 mana", card);
        });
    }
}

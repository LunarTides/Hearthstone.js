module.exports = {
    name: "Emperor Thaurissan",
    stats: [5, 5],
    desc: "At the end of your turn, reduce the Cost of cards in your hand by (1).",
    mana: 6,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Blackrock Mountain",
    id: 52,

    endofturn(plr, game, card) {
        plr.hand.forEach(c => {
            if (c.mana > 0) {
                c.mana -= 1;
            }
        });
    }
}
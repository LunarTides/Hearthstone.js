module.exports = {
    name: "Scaled Nightmare",
    stats: [2, 8],
    desc: "At the start of your turn, double this minion's Attack.",
    mana: 6,
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Epic",
    set: "Whispers of the Old Gods",

    startofturn(plr, game, card) {
        card.setStats(card.stats[0] * 2, card.stats[1]);
    }
}
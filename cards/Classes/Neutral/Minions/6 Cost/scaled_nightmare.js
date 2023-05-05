module.exports = {
    name: "Scaled Nightmare",
    stats: [2, 8],
    desc: "At the start of your turn, double this minion's Attack.",
    mana: 6,
    type: "Minion",
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Epic",
    set: "Whispers of the Old Gods",
    id: 54,

    startofturn(plr, game, card) {
        card.addStats(card.getAttack(), 0);
    }
}

module.exports = {
    name: "Novice Engineer",
    stats: [1, 1],
    desc: "Battlecry: Draw a card.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    id: 39,

    battlecry(plr, game, card) {
        plr.drawCard();
    }
}
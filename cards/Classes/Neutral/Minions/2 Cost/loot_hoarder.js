module.exports = {
    name: "Loot Hoarder",
    stats: [2, 1],
    desc: "Deathrattle: Draw a card.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",

    deathrattle(plr, game, card) {
        plr.drawCard();
    }
}
module.exports = {
    name: "Bloodmage Thalnos",
    stats: [1, 1],
    desc: "Spell Damage +1. Deathrattle: Draw a card.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",
    keywords: ["Spell Damage +1"],
    id: 37,

    deathrattle(plr, game, card) {
        plr.drawCard();
    }
}
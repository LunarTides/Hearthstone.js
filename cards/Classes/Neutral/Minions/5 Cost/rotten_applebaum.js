module.exports = {
    name: "Rotten Applebaum",
    stats: [4, 5],
    desc: "Taunt. Deathrattle: Restore 4 Health to your hero.",
    mana: 5,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Common",
    set: "The Witchwood",
    keywords: ["Taunt"],
    id: 208,

    deathrattle(plr, game, self) {
        plr.addHealth(4);
    }
}

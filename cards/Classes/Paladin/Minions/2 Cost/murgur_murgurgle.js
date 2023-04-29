module.exports = {
    name: "Murgur Murgurgle",
    stats: [2, 1],
    desc: "&BDivine Shield. Deathrattle:&R Shuffle 'Murgurgle Prime' into your deck.",
    mana: 2,
    type: "Minion",
    tribe: "Murloc",
    class: "Paladin",
    rarity: "Legendary",
    set: "Ashes of Outland",
    keywords: ["Divine Shield"],
    id: 256,

    deathrattle(plr, game, self) {
        let minion = new game.Card("Murgur Murgurgle Prime", plr);
        plr.shuffleIntoDeck(minion);
    }
}

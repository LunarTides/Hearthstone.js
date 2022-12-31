module.exports = {
    name: "Elise Starseeker",
    stats: [3, 5],
    desc: "Battlecry: Shuffle the 'Map to the Golden Monkey' into your deck.",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",

    battlecry(plr, game, card) {
        plr.shuffleIntoDeck(new game.Card("Map to the Golden Monkey", plr));
    }
}
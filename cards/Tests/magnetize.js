module.exports = {
    name: "Magnetic Test",
    type: "Minion",
    stats: [2, 1],
    desc: "Magnetic. Battlecry: Adapt.",
    mana: 1,
    tribe: "Mech",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    keywords: ["Magnetic", "Rush"],

    battlecry(plr, game, minion) {
        game.functions.adapt(minion);
    }
}
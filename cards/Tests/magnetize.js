module.exports = {
    name: "Magnetic Test",
    stats: [2, 1],
    desc: "Magnetic. Battlecry: Adapt.",
    mana: 1,
    tribe: "Mech",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    keywords: ["Magnetic", "Rush"],
    uncollectible: true,

    battlecry(plr, game, minion) {
        game.functions.adapt(minion);
    }
}
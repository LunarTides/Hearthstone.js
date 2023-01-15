module.exports = {
    name: "Adapt Test",
    stats: [1, 1],
    desc: "Battlecry: Adapt 2 times.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    battlecry(plr, game, minion) {
        game.functions.adapt(minion);
        game.functions.adapt(minion);
    }
}
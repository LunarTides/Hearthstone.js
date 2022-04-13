module.exports = {
    name: "Adapt Test",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Adapt 2 times.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    battlecry(plr, game, minion) {
        game.functions.adapt(minion);
        game.functions.adapt(minion);
    }
}
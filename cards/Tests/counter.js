module.exports = {
    name: "Counter Test",
    stats: [1, 1],
    desc: "Battlecry: Counter the opponents next Minion.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",

    battlecry(plr, game, minion) {
        plr.counter.push("Minion");
    }
}

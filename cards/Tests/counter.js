module.exports = {
    name: "Counter Test",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Counter the opponents next Minion.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    battlecry(plr, game, minion) {
        game.nextTurn.counter.push("Minion");
    }
}
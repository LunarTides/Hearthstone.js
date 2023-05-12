module.exports = {
    name: "Dredge Example",
    stats: [1, 1],
    desc: "&BDredge.&R This example card shows you how to use `Keyword Functions` like dredge.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    battlecry(plr, game, self) {
        // `game.functions` is an instance of the Functions class as defined in `src/functions.js`.
        game.functions.dredge();
    }
}

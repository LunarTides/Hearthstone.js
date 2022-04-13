module.exports = {
    name: "Invoke Test",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Invoke 2 times.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    battlecry(plr, game, minion) {
        game.functions.invoke(plr);
        game.functions.invoke(plr);
    }
}
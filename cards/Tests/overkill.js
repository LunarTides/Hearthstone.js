module.exports = {
    name: "Overkill Test",
    type: "Minion",
    stats: [2, 1],
    desc: "Overkill: Gain +1/+1.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    overkill(plr, game, minion) {
        minion.addStats(1, 1);
    }
}
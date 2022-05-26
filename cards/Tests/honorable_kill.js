module.exports = {
    name: "Honorable Kill Test",
    stats: [1, 2],
    desc: "Honorable Kill: Gain +1/+1.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    honorablekill(plr, game, minion) {
        minion.addStats(1, 1);
    }
}
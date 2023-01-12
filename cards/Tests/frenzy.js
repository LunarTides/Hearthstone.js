module.exports = {
    name: "Frenzy Test",
    stats: [1, 2],
    desc: "Frenzy: Gain +1/+1.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",

    frenzy(plr, game, minion) {
        minion.addStats(1, 1);
    }
}
module.exports = {
    name: "Spellburst Test",
    stats: [1, 2],
    desc: "Spellburst: Gain +1/+1.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",

    spellburst(plr, game, minion) {
        minion.addStats(1, 1);
    }
}
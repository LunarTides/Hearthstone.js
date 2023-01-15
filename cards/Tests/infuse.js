module.exports = {
    name: "Infuse Test",
    stats: [1, 2],
    desc: "Infuse (2): Gain +2 / +2",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    infuse_num: 2,
    uncollectible: true,

    infuse(plr, game, minion) {
        minion.addStats(1, 1);
    }
}
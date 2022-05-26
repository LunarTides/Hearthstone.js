module.exports = {
    name: "Dormant Test",
    stats: [1, 1],
    desc: "Dormant for 2 turns.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    dormant: 2,

    battlecry(plr, game) {
        game.functions.dredge();
    }
}
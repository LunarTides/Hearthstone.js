module.exports = {
    name: "Colossal Test",
    stats: [5, 3],
    desc: "Colossal +2. Dredge.",
    mana: 2,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    colossal: ["Colossal Test Left Arm", "Colossal Test", "Colossal Test Right Arm"],

    battlecry(plr, game) {
        game.functions.dredge();
    }
}
module.exports = {
    name: "Combo Test",
    type: "Spell",
    desc: "Combo: Gain 2 Mana Crystals this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",

    combo(plr, game) {
        plr.mana += 2
    }
}
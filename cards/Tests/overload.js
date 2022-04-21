module.exports = {
    name: "Overload Test",
    type: "Spell",
    desc: "Gain 2 Mana Crystals this turn only. Overload: 2",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",

    outcast(plr, game) {
        plr.mana += 2;
        plr.overload += 2;
    }
}
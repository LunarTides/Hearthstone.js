module.exports = {
    name: "Lightning Bloom",
    desc: "Gain 2 Mana Crystals this turn only. Overload: (2)",
    mana: 0,
    class: "Druid",
    rarity: "Common",
    set: "Scholomance Academy",

    cast(plr, game, card) {
        plr.mana += 2;
        plr.overload += 2;
    }
}
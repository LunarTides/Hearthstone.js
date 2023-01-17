module.exports = {
    name: "Lightning Bloom",
    desc: "Refresh 2 Mana Crystals. Overload: (2)",
    mana: 0,
    class: "Druid & Shaman",
    rarity: "Common",
    set: "Scholomance Academy",
    id: 11,

    cast(plr, game, card) {
        plr.refreshMana(2);
        plr.overload += 2;
    }
}
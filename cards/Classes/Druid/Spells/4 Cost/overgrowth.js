module.exports = {
    name: "Overgrowth",
    desc: "Gain two empty Mana Crystals.",
    mana: 4,
    class: "Druid",
    rarity: "Common",
    set: "Ashes of Outland",

    cast(plr, game, card) {
        plr.gainEmptyMana(2);
    }
}
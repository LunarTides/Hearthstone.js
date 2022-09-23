module.exports = {
    name: "Wild Growth",
    desc: "Gain an empty Mana Crystal.",
    mana: 3,
    class: "Druid",
    rarity: "Common",
    set: "Core",
    spellClass: "Nature",

    cast(plr, game, card) {
        plr.gainEmptyMana(1);
    }
}
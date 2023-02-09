module.exports = {
    name: "Biology Project",
    desc: "Each player gains 2 Mana Crystals.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "The Boomsday Project",
    spellClass: "Nature",
    id: 16,

    cast(plr, game, card) {
        plr.gainMana(2, true);
        game.opponent.gainMana(2, true);
    }
}

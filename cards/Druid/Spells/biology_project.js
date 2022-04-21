module.exports = {
    name: "Biology Project",
    type: "Spell",
    desc: "Each player gains 2 Mana Crystals.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "The Boomsday Project",
    spellClass: "Nature",

    cast(plr, game, card) {
        plr.maxMana += 2;
        plr.mana += 2;
        
        game.nextTurn.maxMana += 2;
    }
}
module.exports = {
    name: "Pounce",
    desc: "Give your hero +2 Attack this turn.",
    mana: 0,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Rastakhan's Rumble",
    id: 12,

    cast(plr, game, card) {
        plr.attack += 2;
    }
}

module.exports = {
    name: "Pounce",
    desc: "Give your hero +2 Attack this turn.",
    mana: 0,
    class: "Druid",
    rarity: "Common",
    set: "Rastakhan's Rumble",

    cast(plr, game, card) {
        plr.attack += 2;
    }
}
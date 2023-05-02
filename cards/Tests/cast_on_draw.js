module.exports = {
    name: "Cast On Draw Test",
    desc: "Casts When Drawn: Gain 1 Mana Crystal this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    keywords: ["Cast On Draw"],
    uncollectible: true,

    cast(plr, game) {
        plr.gainMana(1);
    }
}
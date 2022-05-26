module.exports = {
    name: "The Coin",
    desc: "Gain 1 Mana Crystal this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",

    cast(plr, game) {
        plr.mana += 1;
    }
}
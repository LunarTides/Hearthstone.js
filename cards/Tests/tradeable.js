module.exports = {
    name: "Tradeable Test",
    desc: "Tradeable. Gain 1 Mana Crystal this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",
    keywords: ["Tradeable"],

    cast(plr, game) {
        plr.mana += 1;
    }
}
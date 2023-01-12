module.exports = {
    name: "Outcast Test",
    desc: "Oucast: Gain 3 Mana Crystals this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Tests",

    outcast(plr, game) {
        plr.mana += 3;
    }
}
module.exports = {
    name: "Outcast Test",
    type: "Spell",
    desc: "Oucast: Gain 3 Mana Crystals this turn only.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",

    outcast(plr, game) {
        plr.mana += 3;
    }
}
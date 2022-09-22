module.exports = {
    name: "Overload Test",
    desc: "Outcast: Cast this spell twice. Gain 2 Mana Crystals this turn only. Overload: 2",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Core",

    cast (plr, game) {
        plr.gainMana(2);
        plr.gainOverload(2);
    },

    outcast(plr, game) {
        plr.gainMana(2);
        plr.gainOverload(2);
    }
}
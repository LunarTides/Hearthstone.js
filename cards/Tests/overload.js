module.exports = {
    name: "Overload Test",
    desc: "Outcast: Cast this spell twice. Gain 2 Mana Crystals this turn only. Overload: 2",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    cast (plr, game) {
        plr.refreshMana(2, plr.maxMaxMana);
        plr.gainOverload(2);
    },

    outcast(plr, game) {
        plr.refreshMana(2, plr.maxMaxMana);
        plr.gainOverload(2);
    }
}
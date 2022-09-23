module.exports = {
    name: "Twig of the World Tree",
    stats: [1, 5],
    desc: "Deathrattle: Gain 10 Mana Crystals.",
    mana: 4,
    class: "Druid",
    rarity: "Legendary",
    set: "Kobolds & Catacombs",

    deathrattle(plr, game, card) {
        plr.gainMana(10);
    }
}
// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Twig of the World Tree",
    stats: [1, 5],
    desc: "Deathrattle: Gain 10 Mana Crystals.",
    type: "Weapon",
    mana: 4,
    class: "Druid",
    rarity: "Legendary",
    set: "Kobolds & Catacombs",
    id: 27,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, card) {
        plr.gainMana(10, true);
    }
}

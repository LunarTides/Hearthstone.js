// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Overgrowth",
    desc: "Gain two empty Mana Crystals.",
    mana: 4,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Ashes of Outland",
    id: 24,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        plr.gainEmptyMana(2);
    }
}

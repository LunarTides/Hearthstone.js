// Created by Hand (before the Card Creator Existed)

/**
 * @type {import("../src/types").Blueprint}
 */
module.exports = {
    name: "The Coin",
    desc: "Gain 1 Mana Crystal this turn only.",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    set: "Core",
    uncollectible: true,

    /**
     * @type {import("../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        plr.refreshMana(1, plr.maxMaxMana);
    }
}

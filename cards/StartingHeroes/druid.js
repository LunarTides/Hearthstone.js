// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Druid Starting Hero",
    displayName: "Malfurion Stormrage",
    desc: "Druid starting hero",
    mana: 0,
    type: "Hero",
    class: "Druid",
    rarity: "Free",
    set: "Core",
    hpDesc: "+1 Attack this turn. +1 Armor.",
    uncollectible: true,
    id: 95,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        plr.addAttack(1);
        plr.armor += 1;
    }
}

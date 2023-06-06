// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    desc: "Warrior starting hero",
    mana: 0,
    type: "Hero",
    class: "Warrior",
    rarity: "Free",
    set: "Core",
    hpDesc: "Gain 2 Armor.",
    uncollectible: true,
    id: 103,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        plr.armor += 2;
    }
}

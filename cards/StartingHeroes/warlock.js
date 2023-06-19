// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    desc: "Warlock starting hero",
    mana: 0,
    type: "Hero",
    class: "Warlock",
    rarity: "Free",
    set: "Core",
    hpDesc: "Draw a card and take 2 damage.",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        plr.remHealth(2);
        plr.drawCard();
    }
}

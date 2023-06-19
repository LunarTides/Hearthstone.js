// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Priest Starting Hero",
    displayName: "Anduin Wrynn",
    desc: "Priest starting hero",
    mana: 0,
    type: "Hero",
    class: "Priest",
    rarity: "Free",
    set: "Core",
    hpDesc: "Restore 2 Health.",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        let target = game.interact.selectTarget("Restore 2 health.", "dontupdate");
        if (!target) return -1;

        target.addHealth(2, true);
    }
}

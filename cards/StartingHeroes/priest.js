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
    id: 99,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        game.suppressedEvents.push("CastSpellOnMinion");
        let target = game.interact.selectTarget("Restore 2 health.", true);
        game.suppressedEvents.pop();

        if (!target) return -1;

        target.addHealth(2, true);
    }
}

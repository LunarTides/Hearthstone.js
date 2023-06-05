// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Silence",
    desc: "Silence a minion.",
    mana: 0,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    spellClass: "Shadow",
    id: 67,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let target = game.interact.selectTarget("Silence a minion.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.silence();
    }
}

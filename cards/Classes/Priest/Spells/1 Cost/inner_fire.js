// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Inner Fire",
    desc: "Change a minion's Attack to be equal to its Health.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    id: 70,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let target = game.interact.selectTarget("Change a minion's Attack to be equal to its Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.setStats(target.getHealth(), target.getHealth());
    }
}

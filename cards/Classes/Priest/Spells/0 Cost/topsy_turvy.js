// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Topsy Turvy",
    desc: "Swap a minion's Attack and Health.",
    mana: 0,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "The Boomsday Project",
    id: 68,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let target = game.interact.selectTarget("Swap a minion's Attack and Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.setStats(target.getHealth(), target.getAttack());
        target.resetMaxHealth();
    }
}

// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Embalming Ritual",
    desc: "Give a minion Reborn.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Saviors of Uldum",
    id: 69,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Give a minion Reborn.", self, null, "minion");

        if (!target) {
            return -1;
        }

        target.addKeyword("Reborn");
    }
}

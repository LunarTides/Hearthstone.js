// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Barkskin",
    desc: "Give a minion +3 Health. Gain 3 Armor.",
    mana: 1,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Kobolds and Catacombs",
    spellClass: "Nature",
    id: 15,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let target = game.interact.selectTarget("Give a minion +3 Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.addStats(0, 3);

        plr.armor += 3;
    }
}

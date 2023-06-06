// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Northshire Cleric",
    stats: [1, 3],
    desc: "Whenever a minion is healed, draw a card.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    id: 61,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "HealthRestored") return false;

        plr.drawCard();
    }
}

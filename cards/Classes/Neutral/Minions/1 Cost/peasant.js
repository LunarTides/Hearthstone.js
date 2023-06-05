// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Peasant",
    stats: [2, 1],
    desc: "At the start of your turn, draw a card.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "United in Stormwind",
    id: 35,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "StartTurn" || game.player == plr) return;

        plr.drawCard();
    }
}

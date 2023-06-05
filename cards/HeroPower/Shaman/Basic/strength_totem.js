// Created by Hand (before the Card Creator Existed)

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Strength Totem",
    stats: [0, 2],
    desc: "At the end of your turn, give another friendly minion +1 Attack.",
    mana: 1,
    type: "Minion",
    tribe: "Totem",
    class: "Shaman",
    rarity: "Free",
    set: "Legacy",
    id: 85,
    uncollectible: true,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        var t = game.board[plr.id];

        if (t.length > 0) {
            t[game.functions.randInt(0, t.length - 1)].addStats(1, 0);
        }
    }
}

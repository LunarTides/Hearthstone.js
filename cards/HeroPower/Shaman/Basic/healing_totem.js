// Created by Hand (before the Card Creator Existed)

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Healing Totem",
    stats: [0, 2],
    desc: "At the end of your turn, restore 1 Health to all friendly minions.",
    mana: 1,
    type: "Minion",
    tribe: "Totem",
    class: "Shaman",
    rarity: "Free",
    set: "Legacy",
    uncollectible: true,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        var t = game.board[plr.id];

        if (t.length > 0) {
            t.forEach(m => {
                m.addStats(0, 1, true);
            });
        }
    }
}

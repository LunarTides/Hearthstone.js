// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Zentimo",
    stats: [1, 3],
    desc: "Whenever you target a minion with a spell, it also targets adjacent ones.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 316,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        game.functions.addEventListener("CastSpellOnMinion", true, val => {
            let [spell, minion] = val;
            if (!spell) return;

            let b = game.board[minion.plr.id];
            let index = b.indexOf(minion);
            if (index === -1) return true;

            if (index > 0) {
                plr.forceTarget = b[index - 1];
                spell.activate("cast");
            }

            if (index < b.length - 1) {
                plr.forceTarget = b[index + 1];
                spell.activate("cast");
            }

            plr.forceTarget = null;

            return true;
        }, 1);
    }
}

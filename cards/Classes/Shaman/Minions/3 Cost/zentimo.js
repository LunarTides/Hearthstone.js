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
    passive(plr, game, self, key, val) {
        if (key != "PlayCardUnsafe" || val == self) return;

        let minion;

        let removePassive = game.functions.addEventListener("CastSpellOnMinion", (_val) => {
            minion = _val;
            return true;
        }, () => {
            let b = game.board[minion.plr.id];
            let index = b.indexOf(minion);
            if (index === -1) return true;

            if (index > 0) {
                plr.forceTarget = b[index - 1];
                val.activate("cast");
            }

            if (index < b.length - 1) {
                plr.forceTarget = b[index + 1];
                val.activate("cast");
            }

            plr.forceTarget = null;

            return true;
        }, 1);

        // Undo after cast function was called
        let cardsPlayedPassiveRemove;
        let cardsCancelledPassiveRemove;

        cardsPlayedPassiveRemove = game.functions.addEventListener("PlayCard", (_val) => {
            return _val == val;
        }, () => {
            removePassive();
            cardsCancelledPassiveRemove();
        }, 1);
        cardsCancelledPassiveRemove = game.functions.addEventListener("CancelCard", (_val) => {
            return _val[0] == val;
        }, () => {
            removePassive();
            cardsPlayedPassiveRemove();
        }, 1);
    }
}

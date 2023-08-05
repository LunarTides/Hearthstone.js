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
        // Scenario:
        // Player plays a spell that targets a minion:
        // PlayCardUnsafe [PotentialSpell] gets broadcast

        // Zentimo responds with the following 3 actions:
        // CastSpellOnMinion event listener set up
        // PlayCard event listener set up
        // CancelCard event listener set up

        // [PotentialSpell]'s text is ran. If it is not a spell that targets a minion (or the card gets cancelled), skip the next 2 lines
        // CastSpellOnMinion [Target] gets broadcast
        // CastSpellOnMinion event listener: Cast [PotentionalSpell] on [Target]'s neighbors.

        // Either, PlayCard or CancelCard [PotentialSpell] gets broadcast.
        // PlayCard or CancelCard event listener: Tear down all event listeners that was created

        if (key != "PlayCardUnsafe" || val == self) return;


        let removePassive = game.functions.addEventListener("CastSpellOnMinion", () => {
            return true;
        }, (minion) => {
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

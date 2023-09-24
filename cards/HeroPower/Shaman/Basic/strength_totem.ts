// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Strength Totem",
    stats: [0, 2],
    desc: "At the end of your turn, give another friendly minion +1 Attack.",
    cost: 1,
    type: "Minion",
    tribe: "Totem",
    classes: ["Shaman"],
    rarity: "Free",
    uncollectible: true,
    id: 18,

    passive(plr, game, self, key, val) {
        // At the end of your turn, give another friendly minion +1 Attack.
        
        // Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
        if (!(key === "EndTurn" && game.player === plr)) return;

        // The list that to choose from. Remove this minion from the list
        let board = game.board[plr.id].filter(card => card.type === "Minion");
        game.functions.remove(board, self);

        // Choose the random minion
        const minion = game.functions.randList(board)?.actual;
        if (!minion) return;

        // Give that minion +1 Attack
        minion.addStats(1, 0);
    },

    test(plr, game, self) {
        // TODO: Add proper tests
        return true;
    }
}

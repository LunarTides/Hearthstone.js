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

        // If there is no other minions on the board, return
        if (board.length <= 0) return;

        // Choose the random minion
        let minion = game.functions.randList(board).actual;

        // Give that minion +1 Attack
        minion.addStats(1, 0);
    }
}

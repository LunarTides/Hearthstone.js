/**
 * The entry point of the game.
 * 
 * Hearthstone.js - Hearthstone but console based.
 * Copyright (C) 2022  LunarTides
 * 
 * @module Index
 */

import { createGame } from "./internal.js";

export function main() {
    const { game, player1, player2 } = createGame();

    game.interact.printName();

    // Ask the players for deck codes.
    [player1, player2].forEach(plr => {
        if (plr.deck.length > 0) return;
        
        // Put this in a while loop to make sure the function repeats if it fails.
        while (!game.interact.deckCode(plr)) {};
    });

    game.startGame();

    game.interact.mulligan(player1);
    game.interact.mulligan(player2);

    try {
        // Game loop
        while (game.running) game.interact.doTurn();
    } catch (err) {
        game.functions.createLogFile(err); // Create error report file

        throw err;
    }
}

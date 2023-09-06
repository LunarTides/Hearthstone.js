/**
 * The entry point of the game.
 * 
 * Hearthstone.js - Hearthstone but console based.
 * Copyright (C) 2022  LunarTides
 * 
 * @module Index
 */

import { Player, createGame } from "./internal.js";

/**
 * Deckcodes
 */
let decks: string[] = [];

/**
 * Runs the game.
 * 
 * @param _decks The decks to import
 */
export function runner(_decks: string[]) {
    decks = _decks;
    main();
}

function main() {
    const { game, player1, player2 } = createGame();

    game.interact.printName();

    // If decks were exported by the deck creator, assign them to the players.
    decks.forEach((d, i) => {
        if (i >= 2) return;

        let rng: number;
        let plr: Player;

        do {
            rng = game.functions.randInt(1, 2);

            if (rng === 1) plr = player1;
            else plr = player2;
        } while(plr.deck.length > 0);

        game.functions.deckcode.import(plr, d);

        game.input(`Player ${rng}'s Deck was automatically set to: ${d}\n`); 
    });

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

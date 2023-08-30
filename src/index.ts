/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  LunarTides
*/

import { Card } from "./card";
import { Game } from "./game";
import { Player } from "./player";
import { set } from "./shared";

let p1: Player;
let p2: Player;

let game: Game;

/**
 * Deckcodes
 */
let decks: string[] = [];
export function runner(_decks: string[]) {
    Object.keys(require.cache).forEach(k => delete require.cache[k]);

    try {
        game.cards = [];
        game.config = undefined;
    } catch {};

    decks = _decks;
    main();
}

function main() {
    p1 = new Player("Player 1");
    p2 = new Player("Player 2");
    game = new Game(p1, p2);

    set(game);

    game.running = true;

    game.functions.importCards(__dirname + '/../cards');
    game.functions.importConfig(__dirname + '/../config');

    game.interact.printName();

    // If decks were exported by the deck creator, assign them to the players.
    decks.forEach((d, i) => {
        if (i >= 2) return;

        let rng: number;
        let plr: Player;

        do {
            rng = game.functions.randInt(1, 2);

            if (rng === 1) plr = p1;
            else plr = p2;
        } while(plr.deck.length > 0);

        game.functions.deckcode.import(plr, d);

        game.input(`Player ${rng}'s Deck was automatically set to: ${d}\n`); 
    });

    // Ask the players for deck codes.
    [p1, p2].forEach(plr => {
        if (plr.deck.length > 0) return;
        
        // Put this in a while loop to make sure the function repeats if it fails.
        while (!game.interact.deckCode(plr)) {};
    });

    game.startGame();

    game.interact.mulligan(p1);
    game.interact.mulligan(p2);

    try {
        // Game loop
        while (game.running) game.interact.doTurn();
    } catch (err) {
        game.functions.createLogFile(err); // Create error report file

        throw err;
    }
}

exports.runner = runner;
if (require.main == module) main();

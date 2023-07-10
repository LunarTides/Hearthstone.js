/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  LunarTides
*/

const { Game } = require("./game");
const { Player } = require("./player");
const { set }  = require("./shared");

/**
 * @type {Player}
 */
let p1;

/**
 * @type {Player}
 */
let p2;

/**
 * @type {Game}
 */
let game;

let decks = [];
function runner(_decks) {
    try {
        game.cards = [];
        game.config = {};
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

    decks.forEach((d, i) => {
        if (i >= 2) return;

        let rng;
        let plr;

        do {
            rng = game.functions.randInt(1, 2);
            plr = game["player" + rng];
        } while(plr.deck.length > 0);

        game.functions.deckcode.import(plr, d);

        game.input(`Player ${rng}'s Deck was automatically set to: ${d}\n`); 
    });
    // Ask the players for deck codes.
    if (p1.deck.length <= 0) game.interact.deckCode(p1);
    if (p2.deck.length <= 0) game.interact.deckCode(p2);

    game.startGame();

    game.interact.mulligan(p1);
    game.interact.mulligan(p2);

    try {
        while (game.running) game.interact.doTurn();
    } catch (err) {
        game.functions.createLogFile(err); // Create error report file

        throw err;
    }
}

exports.runner = runner;
if (require.main == module) main();

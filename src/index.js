/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  Keatpole
*/

const { Game } = require("./game");
const { Player } = require("./player");

let p1;
let p2;
let game;

let decks = [];
function runner(_decks) {
    decks = _decks;
    main();
}

function main() {
    p1 = new Player("Player 1");
    p2 = new Player("Player 2");
    game = new Game(p1, p2);

    game.running = true;

    game.interact.printName();

    game.functions.importCards(__dirname + '/../cards');
    game.functions.importConfig(__dirname + '/../config');

    decks.forEach((d, i) => {
        if (i >= 2) return;

        let rng;
        let plr;

        do {
            rng = game.functions.randInt(1, 2);
            plr = game["player" + rng];
        } while(plr.deck.length > 0);

        game.functions.importDeck(plr, d);

        game.input(`Player ${rng}'s Deck was automatically set to: ${d}\n`); 
    });
    // Ask the players for deck codes.
    if (p1.deck.length <= 0) game.interact.deckCode(p1);
    if (p2.deck.length <= 0) game.interact.deckCode(p2);

    game.startGame();
    game.set("dirname", __dirname);

    game.interact.mulligan(p1);
    game.interact.mulligan(p2);

    while (game.running) game.interact.doTurn();
}

exports.runner = runner;
if (require.main == module) main();

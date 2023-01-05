/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  Keatpole
*/

const { Game } = require("./src/game");
const { Player } = require("./src/player");
const config = require("./config");

const p1 = new Player("Player 1");
const p2 = new Player("Player 2");
const game = new Game(p1, p2, config);

if (!config.debug) {
    game.interact.printName();

    p1.name = game.input("Player 1, what is your name? ");
    p2.name = game.input("Player 2, what is your name? ");
}

game.functions.importCards(__dirname + '/cards');

// Ask the players for deck codes.
game.interact.deckCode(p1);
game.interact.deckCode(p2);

game.startGame();
game.set("dirname", __dirname);

game.interact.mulligan(p1);
game.interact.mulligan(p2);

while (true) game.interact.doTurn();

const { Game } = require("./game");
const { Player } = require("./player");
const config = require("../config.json");

let player1 = new Player("Player 1");
let player2 = new Player("Player 2");
let game = new Game(player1, player2, config);

if (!config.debug) {
    const input = require("readline-sync").question; // Python input

    game.interact.printName();

    player1.name = input("Player 1, what is your name? ");
    player2.name = input("Player 2, what is your name? ");
}

game.functions.importCards(__dirname + '/../cards');

// Ask the players for deck codes.
game.interact.deckCode(player1);
game.interact.deckCode(player2);

game.startGame();

game.interact.mulligan(player1);
game.interact.mulligan(player2);

while (true) game.interact.doTurn();

// Part of this code was copied from an example given by ChatGPT
const assert = require('assert');
const colors = require("colors");
const { Player } = require("../src/player");
const { Game } = require("../src/game");
const { set } = require("../src/shared");

// Setup the game / copied from the card updater
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");

const game = new Game(test_player1, test_player2);
game.dirname = __dirname + "/../";
set(game);

const functions = game.functions;
const interact = game.interact;

functions.importCards(__dirname + "/../cards");
functions.importConfig(__dirname + "/../config");

game.config.P1AI = false;
game.config.P2AI = false;

// Remove functions that clear the screen
interact.printName = () => {};
interact.printAll = () => {};
interact.printLicense = () => {};
interact.cls = () => {};

// Begin testing
describe("Interact", () => {
    it ('example replace me later', () => {
        assert.ok(false); // Just fail
    });
});

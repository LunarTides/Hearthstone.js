// Part of this code was copied from an example given by ChatGPT
const assert = require('assert');
const colors = require("colors");
const { Player } = require("../src/player");
const { Game } = require("../src/game");
const { set } = require("../src/shared");
const { Card } = require('../src/card');
const { AI } = require('../src/ai');

// Setup the game / copied from the card updater
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");

const game = new Game(test_player1, test_player2);
game.dirname = __dirname + "/../";
set(game);

game.player1 = test_player1;
game.player2 = test_player2;

game.player1.id = 0;
game.player2.id = 1;

const functions = game.functions;
const interact = game.interact;

functions.importCards(__dirname + "/../cards");
functions.importConfig(__dirname + "/../config");

game.config.P1AI = false;
game.config.P2AI = false;

game.doConfigAI();

// Remove functions that clear the screen
interact.printName = () => {};
interact.printAll = () => {};
interact.printLicense = () => {};
interact.cls = () => {};

const ai = new game.AI(test_player1);

// Begin testing
describe("AI", () => {
    beforeEach(() => {
        game.board = [[], []];
        game.player = test_player1;
        game.opponent = test_player2; 

        test_player1.hand = [];
        test_player1.deck = [];
    });

    it ('should calculate move', () => {
        // TODO: Add this
    });

    it ('should find out if it can attack', () => {
        // TODO: Add this
    });

    it ('should find out if it can hero power', () => {
        // TODO: Add this
    });

    it ('should find out if it can use a location', () => {
        // TODO: Add this
    });

    it ('should find out if a specific card can attack', () => {
        // TODO: Add this
    });

    it ('should find out if a specific card can be targetted', () => {
        // TODO: Add this
    });

    it ('should find trades', () => {
        // TODO: Add this
    });

    it ('should correctly score players', () => {
        // TODO: Add this
    });

    it ('should find the current winner', () => {
        // TODO: Add this
    });
    
    it ('should find out if a taunt exists', () => {
        // TODO: Add this
    });

    it ('should do a trade', () => {
        // TODO: Add this
    });

    it ('should do a general attack', () => {
        // TODO: Add this
    });

    it ('should do a risky attack', () => {
        // TODO: Add this
    });

    it ('should choose attacker and target', () => {
        // TODO: Add this
    });

    it ('should choose target', () => {
        // TODO: Add this
    });

    it ('should choose attacker', () => {
        // TODO: Add this
    });

    it ('should attack', () => {
        // TODO: Add this
    });

    it ('should attack using legacy 1', () => {
        // TODO: Add this
    });

    it ('should select a target', () => {
        // TODO: Add this
    });

    it ('should discover', () => {
        // TODO: Add this
    });

    it ('should dredge', () => {
        // TODO: Add this
    });

    it ('should choose one', () => {
        // TODO: Add this
    });

    it ('should answer a question', () => {
        // TODO: Add this
    });

    it ('should answer a yes/no question', () => {
        // TODO: Add this
    });

    it ('should trade cards', () => {
        // TODO: Add this
    });

    it ('should mulligan', () => {
        // TODO: Add this
    });

    it ('should evaluate text', () => {
        // TODO: Add this
    });

    it ('should evaluate cards', () => {
        // TODO: Add this
    });
});

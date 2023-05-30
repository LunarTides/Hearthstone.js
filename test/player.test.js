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

// Begin testing
describe("Player", () => {
    beforeEach(() => {
        game.board = [[], []];
        game.player = test_player1;
        game.opponent = test_player2; 

        test_player1.hand = [];
        test_player1.deck = [];
    });

    it ('should get their opponent', () => {
        let op = test_player1.getOpponent();

        assert.equal(op.id, game.opponent.id);
    });

    it ('should refresh mana', () => {
        test_player1.refreshMana(100)

        assert.equal(test_player1.mana, test_player1.maxMana);
    });

    it ('should gain empty mana', () => {
        test_player1.maxMana = 0;
        test_player1.gainEmptyMana(100);

        assert.equal(test_player1.maxMana, 100);
    });
    it ('should gain empty mana capped', () => {
        test_player1.maxMana = 0;
        test_player1.gainEmptyMana(100, true);

        assert.equal(test_player1.maxMana, 10);
    });
    
    it ('should gain mana', () => {
        test_player1.mana = 0;
        test_player1.maxMana = 0;
        test_player1.gainMana(100);

        assert.equal(test_player1.mana, 100);
        assert.equal(test_player1.maxMana, 100);
    });
    it ('should gain mana capped', () => {
        test_player1.mana = 0;
        test_player1.maxMana = 0;
        test_player1.gainMana(100, true);

        assert.equal(test_player1.mana, 10);
        assert.equal(test_player1.maxMana, 10);
    });

    it ('should gain overload', () => {
        test_player1.overload = 0;
        test_player1.gainOverload(10);

        assert.equal(test_player1.overload, 10);
    });

    it ('should set weapon', () => {
        // TODO: Add this
    });

    it ('should destroy weapon', () => {
        // TODO: Add this
    });

    it ('should set weapon', () => {
        // TODO: Add this
    });

    it ('should add attack', () => {
        // TODO: Add this
    });

    it ('should add health', () => {
        // TODO: Add this
    });

    it ('should remove health', () => {
        // TODO: Add this
    });

    it ('should get health', () => {
        // TODO: Add this
    });

    it ('should shuffle into deck', () => {
        // TODO: Add this
        // Make sure the deck is shuffled afterwards
    });

    it ('should add to bottom of deck', () => {
        // TODO: Add this
    });

    it ('should draw card', () => {
        // TODO: Add this
    });

    it ('should draw specific card', () => {
        // TODO: Add this
    });

    it ('should add card to hand', () => {
        // TODO: Add this
    });

    it ('should remove card from hand', () => {
        // TODO: Add this
    });

    it ('should set hero', () => {
        // TODO: Add this
    });

    it ('should set to starting hero', () => {
        // TODO: Add this
    });

    it ('should hero power', () => {
        test_player1.heroClass = "Mage";
        test_player1.mana = 10;
        test_player1.canUseHeroPower = true;
        test_player1.setToStartingHero();

        test_player1.inputQueue = ["yes", "face", "y"]; // Yes, use the hero power. Select a hero/face. Select the opponent's hero/face.

        interact.handleCmds("hero power");

        assert.equal(test_player2.health, test_player2.maxHealth - 1); // Test_player2 should now have 2 less health
    });
    
    it ('should trade corpses', () => {
        // TODO: Add this
    });

    it ('should test runes', () => {
        // TODO: Add this
    });
});

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
        let move = ai.calcMove();

        // The ai can't do anything
        assert.equal(move, "end");
    });

    it ('should find out if it can attack', () => {
        let canAttack = ai._canAttack();

        assert.equal(canAttack, false);
    });

    it ('should find out if it can hero power', () => {
        let canHeroPower = ai._canHeroPower();

        assert.equal(canHeroPower, false);
    });

    it ('should find out if it can use a location', () => {
        let canUseLocation = ai._canUseLocation();

        assert.equal(canUseLocation, false);
    });

    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.sleepy = true;
        minion.attackTimes = 0;
        
        let canAttack = ai._canMinionAttack(minion);

        assert.equal(canAttack, false);
    });
    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.ready();
        
        let canAttack = ai._canMinionAttack(minion);

        assert.equal(canAttack, true);
    });

    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        
        let canTarget = ai._canTargetMinion(minion);

        assert.equal(canTarget, true);
    });
    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        minion.immune = true;
        
        let canTarget = ai._canTargetMinion(minion);

        assert.equal(canTarget, false);
    });

    it ('should find trades', () => {
        let trades = ai._attackFindTrades();

        assert.equal(trades[0].length, 0);
        assert.equal(trades[1].length, 0);
    });

    it ('should correctly score players', () => {
        let score = ai._scorePlayer(test_player1, []);

        assert.ok(score > 0);
    });

    it ('should find the current winner', () => {
        let score = ai._findWinner([[], []]);

        assert.equal(score[0].id, test_player2.id);
        assert.ok(score[1] > 0);
    });
    
    it ('should find out if a taunt exists', () => {
        let taunt = ai._tauntExists(false);

        assert.ok(!taunt);
    });
    it ('should find out if a taunt exists', () => {
        let taunts = ai._tauntExists(true);

        assert.equal(taunts.length, 0);
    });

    it ('should do a trade', () => {
        let result = ai._attackTrade();

        assert.equal(result, null);
    });

    it ('should do a general attack', () => {
        let result = ai._attackGeneral([[], []]);

        assert.equal(result[0], -1);
    });

    it ('should do a risky attack', () => {
        let result = ai._attackGeneralRisky();

        assert.equal(result[1], ai.plr.getOpponent());
    });

    it ('should choose attacker and target', () => {
        let result = ai._attackGeneralMinion();

        assert.equal(result[0], -1);
        assert.equal(result[1], ai.plr.getOpponent());
    });

    it ('should choose target', () => {
        let result = ai._attackGeneralChooseTarget();

        assert.equal(result, ai.plr.getOpponent());
    });

    it ('should choose attacker', () => {
        let result = ai._attackGeneralChooseAttacker(true);

        assert.equal(result, -1);
    });

    it ('should attack', () => {
        let result = ai.attack();

        assert.equal(result[0], -1);
        assert.equal(result[1], ai.plr.getOpponent());
    });

    it ('should attack using legacy 1', () => {
        let result = ai.legacy_attack_1();

        assert.equal(result[0], -1);
        assert.equal(result[1], -1);
    });

    it ('should select a target', () => {
        let result = ai.selectTarget("Deal 1 damage.", false, null, null, []);

        // There are no minions and the prompt is bad, so the ai should select the enemy hero
        assert.equal(result, ai.plr.getOpponent());
    });

    it ('should discover', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.discover(cards);

        assert.equal(result.id, cards[0].id);
    });

    it ('should dredge', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.dredge(cards);

        assert.equal(result.id, cards[0].id);
    });

    it ('should choose one', () => {
        let options = [
            "Heal 9999 health.",
            "Destroy a friendly minion.",
            "Destroy the enemy hero."
        ];
        
        let result = ai.chooseOne(options);

        // "Destroy the enemy hero" is the best
        assert.equal(result, 2);
    });

    it ('should answer a question', () => {
        let prompt = "What do you want to do?";
        let options = [
            "Heal 9999 health.",
            "Destroy a friendly minion.",
            "Destroy the enemy hero."
        ];
        
        let result = ai.question(prompt, options);

        // "Destroy the enemy hero" is the best
        assert.equal(result, 2 + 1);
    });

    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy the enemy hero?";
        
        let result = ai.yesNoQuestion(question);

        assert.equal(result, true);
    });
    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy your hero?";
        
        let result = ai.yesNoQuestion(question);

        assert.equal(result, false);
    });

    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        
        let result = ai.trade(card);

        // No cards to trade into
        assert.equal(result, false);
    });
    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        test_player1.shuffleIntoDeck(card.imperfectCopy(card));
        test_player1.shuffleIntoDeck(card.imperfectCopy(card));
        test_player1.mana = 1;
        
        let result = ai.trade(card);

        assert.equal(result, true);
    });

    it ('should mulligan', () => {
        let card = new Card("Sheep", test_player1);

        for (let i = 0; i < 3; i++) test_player1.addToHand(card.imperfectCopy(card));        
        let result = ai.mulligan(card);

        // Mulligan all their cards
        assert.equal(result, "123");
    });

    it ('should evaluate text', () => {
        let text = "Destroy the enemy hero";

        let result = ai.analyzePositive(text);

        // REALLY good
        assert.equal(result, 9);
    });
    it ('should evaluate text', () => {
        let text = "Destroy your hero";

        let result = ai.analyzePositive(text);

        // REALLY bad
        // Destroy = -9, Your = +1
        assert.equal(result, -9 + 1);
    });

    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);

        let result = ai.analyzePositiveCard(card);

        // Not very good
        assert.equal(result, -0.35);
    });
    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);
        card.setStats(9, 9)

        let result = ai.analyzePositiveCard(card);

        // Pretty good
        assert.equal(result, 2.85);
    });
});

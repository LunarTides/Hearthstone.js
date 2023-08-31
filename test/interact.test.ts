// Part of this code was copied from an example given by ChatGPT
import "colors";
import assert from 'assert';
import { Player, Game, set, Card } from "../src/internal.js";

// Setup the game / copied from the card updater
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");

const game = new Game(test_player1, test_player2);
set(game);

game.player1 = test_player1;
game.player2 = test_player2;

const functions = game.functions;
const interact = game.interact;

functions.importCards("../cards");
functions.importConfig("../config");

game.config.P1AI = false;
game.config.P2AI = false;

game.doConfigAI();

// Remove functions that clear the screen
interact.printName = () => {};
interact.printAll = () => {};
interact.printLicense = () => {};
interact.cls = () => {};

const summonMinion = (name = "Sheep", plr = test_player1) => {
    return game.summonMinion(new Card(name, plr), plr);
}

// Begin testing
describe("Interact", () => {
    beforeEach(() => {
        game.board = [[], []];
        game.player = test_player1;
        game.opponent = test_player2; 

        test_player1.hand = [];
        test_player1.deck = [];
    });

    it ('should attack', () => {
        let curm = summonMinion("Sheep", test_player1);
        let opm = summonMinion("Sheep", test_player2);
        if (!(curm instanceof Card)) assert.fail("curm is not card");
        if (!(opm instanceof Card)) assert.fail("opm is not card");

        curm.ready();
        opm.ready();

        test_player1.inputQueue = ["1", "1"];
        interact.doTurnAttack();

        assert.equal(curm.getHealth(), 0);
        assert.equal(opm.getHealth(), 0);
    });

    it ('should handle `end` command', () => {
        interact.handleCmds("end");

        assert.equal(game.player, test_player2);
        assert.equal(game.opponent, test_player1);
    });
    it ('should handle `hero power` command', () => {
        test_player1.heroClass = "Mage";
        test_player1.mana = 10;
        test_player1.canUseHeroPower = true;
        test_player1.setToStartingHero();

        test_player2.health = 30;

        test_player1.inputQueue = ["yes", "face", "y"]; // Yes, use the hero power. Select a hero/face. Select the opponent's hero/face.

        interact.handleCmds("hero power");

        assert.equal(test_player2.health, 29); // Test_player2 should now have 2 less health
    });
    it ('should handle `attack` command', () => {
        let curm = summonMinion("Sheep", test_player1);
        let opm = summonMinion("Sheep", test_player2);
        if (!(curm instanceof Card)) assert.fail("curm is not card");
        if (!(opm instanceof Card)) assert.fail("opm is not card");

        curm.ready();
        opm.ready();

        test_player1.inputQueue = ["1", "1"];
        interact.handleCmds("attack");

        assert.equal(curm.getHealth(), 0);
        assert.equal(opm.getHealth(), 0);
    });
    it ('should handle `use` command', () => {
        let minion = summonMinion("Sheep", test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not card");

        minion.type = "Location";
        minion.cooldown = 0;

        test_player1.inputQueue = ["1"];
        interact.handleCmds("use");

        assert.equal(minion.cooldown, minion.backups.init.cooldown);
        assert.equal(minion.getHealth(), 0);
    });
    it ('should handle `give` debug command', () => {
        game.config.debug = true;

        let old_length = test_player1.hand.length;
        game.interact.handleCmds("/give Sheep");

        let card = test_player1.hand[test_player1.hand.length - 1];
        card.name = "Foo";

        assert.equal(test_player1.hand.length, old_length + 1);
        assert.equal(card.name, "Foo");
    });
    it ('should handle `eval` debug command', () => {
        game.config.debug = true;
        game.evaling = false;

        game.interact.handleCmds("/eval game.evaling = \"true\"");

        assert.ok(game.evaling);
        game.evaling = false;
    });
    it ('should handle `debug` debug command', () => {
        game.config.debug = true;

        game.interact.handleCmds("/debug");

        assert.equal(test_player1.maxMaxMana, 1000);
        assert.equal(test_player1.maxMana, 1000);
        assert.equal(test_player1.mana, 1000);

        assert.equal(test_player1.health, 10000 + test_player1.maxHealth);
        assert.equal(test_player1.armor, 100000);
        assert.equal(test_player1.fatigue, 0);
    });
    it ('should handle `exit` debug command', () => {
        game.config.debug = true;

        game.interact.handleCmds("/exit");

        assert.equal(game.running, false);
        game.running = true;
    });
    it ('should handle invalid command', () => {
        game.config.debug = false;

        let res = game.interact.handleCmds("dsadhusadhasuhudsahuda");

        assert.equal(res, -1);
    });

    it ('should do turn logic', () => {
        test_player1.addToHand(new Card("Sheep", test_player1));
        let res = interact.doTurnLogic("1");

        assert.ok(res instanceof Card);
        assert.equal(res.name, "Sheep");
    });

    it ('should do a move', () => {
        test_player1.addToHand(new Card("Sheep", test_player1));
        test_player1.inputQueue = ["1"];
        let res = interact.doTurn();

        assert.ok(res instanceof Card);
        assert.equal(res.name, "Sheep");
    });

    it ('should use a location', () => {
        let minion = summonMinion("Sheep", test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not card");

        minion.type = "Location";
        minion.cooldown = 0;

        test_player1.inputQueue = ["1"];
        let ret = interact.useLocation();

        assert.equal(minion.cooldown, minion.backups.init.cooldown);
        assert.equal(minion.getHealth(), 0);
        assert.equal(ret, true);
    });

    it ('should mulligan', () => {
        let minion = new Card("Sheep", test_player1);
        test_player1.shuffleIntoDeck(minion.imperfectCopy());
        minion.name = "Foo";
        test_player1.addToHand(minion);

        test_player1.inputQueue = ["1"];
        interact.mulligan(test_player1);

        assert.notEqual(test_player1.hand[0].name, "Foo");
    });

    it ('should choose one', () => {
        test_player1.inputQueue = ["2"];

        let input = interact.chooseOne("Choose one.", ["One", "Two", "Three"]);

        assert.equal(input, 1);
    });

    it ('should answer a question', () => {
        test_player1.inputQueue = ["2"];

        let input = interact.question(test_player1, "What is your favorite color?", ["Red", "Green", "Blue"]);

        assert.equal(input, "Green");
    });

    it ('should answer a yes/no question', () => {
        test_player1.inputQueue = ["yes"];

        let input = interact.yesNoQuestion(test_player1, "Foo?");

        assert.equal(input, true);
    });

    it ('should discover a minion', () => {
        const log = console.log;
        console.log = () => {};

        let pool = game.functions.getCards().filter(c => c.type == "Minion");
        test_player1.inputQueue = ["1"];

        let card = interact.discover("Discover a minion", pool);

        console.log = log;

        assert.ok(card);
        assert.ok(card instanceof Card);
        assert.equal(card.type, "Minion");
        assert.ok(pool.map(c => c.name).includes(card.name));
    });

    it ('should select a minion', () => {
        let target = summonMinion("Sheep", test_player1);
        summonMinion("Sheep", test_player2);

        test_player1.inputQueue = ["1", "n"];

        let card = interact.selectTarget("Select a minion.", null, null, "minion");

        assert.ok(card instanceof Card);
        assert.equal(card.type, "Minion");
        assert.equal(card, target);
    });
    it ('should select a hero', () => {
        test_player1.inputQueue = ["face"];

        let hero = interact.selectTarget("Select a minion.", null, "enemy", null);

        assert.equal(hero, test_player2);
    });

    it ('should get a readable card', () => {
        let target = new Card("Sheep", test_player1);

        let card = interact.getReadableCard(target, 1);

        // @ts-expect-error brightGreen does not exist
        const expected = "[1] " + "{1} ".cyan + "Sheep".bold + " [1 / 1]".brightGreen + " " + "(Minion)".yellow;

        assert.equal(card, expected);
    });
});

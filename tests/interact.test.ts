// Part of this code was copied from an example given by ChatGPT
import { Player, Game, Card } from "../src/internal";
import chalk from "chalk";

// Setup the game / copied from the card updater
const game = new Game();
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");
game.setup(test_player1, test_player2);

game.player1 = test_player1;
game.player2 = test_player2;

const functions = game.functions;
const interact = game.interact;

functions.importCards(functions.dirname() + "cards");
functions.importConfig(functions.dirname() + "config");

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

        expect(curm).toBeInstanceOf(Card);
        expect(opm).toBeInstanceOf(Card);

        curm = curm as Card;
        opm = opm as Card;

        curm.ready();
        opm.ready();

        test_player1.inputQueue = ["1", "1"];
        interact.doTurnAttack();

        expect(curm.getHealth()).toBe(0);
        expect(opm.getHealth()).toBe(0);
    });

    it ('should handle `end` command', () => {
        interact.handleCmds("end");

        expect(game.player).toBe(test_player2);
        expect(game.opponent).toBe(test_player1);
    });
    it ('should handle `hero power` command', () => {
        test_player1.heroClass = "Mage";
        test_player1.mana = 10;
        test_player1.canUseHeroPower = true;
        test_player1.setToStartingHero();

        test_player2.health = 30;

        test_player1.inputQueue = ["yes", "face", "y"]; // Yes, use the hero power. Select a hero/face. Select the opponent's hero/face.

        interact.handleCmds("hero power");

        expect(test_player2.health).toBe(29); // Test_player2 should have 1 less health
    });
    it ('should handle `attack` command', () => {
        let curm = summonMinion("Sheep", test_player1);
        let opm = summonMinion("Sheep", test_player2);

        expect(curm).toBeInstanceOf(Card);
        expect(opm).toBeInstanceOf(Card);

        curm = curm as Card;
        opm = opm as Card;

        curm.ready();
        opm.ready();

        test_player1.inputQueue = ["1", "1"];
        interact.handleCmds("attack");

        expect(curm.getHealth()).toBe(0);
        expect(opm.getHealth()).toBe(0);
    });
    it ('should handle `use` command', () => {
        let minion = summonMinion("Sheep", test_player1);

        expect(minion).toBeInstanceOf(Card);
        minion = minion as Card;

        minion.type = "Location";
        minion.cooldown = 0;

        test_player1.inputQueue = ["1"];
        interact.handleCmds("use");

        expect(minion.cooldown).toBe(minion.backups.init.cooldown);
        expect(minion.getHealth()).toBe(0);
    });
    it ('should handle `give` debug command', () => {
        game.config.debug = true;

        let old_length = test_player1.hand.length;
        game.interact.handleCmds("/give Sheep");

        let card = test_player1.hand[test_player1.hand.length - 1];
        card.name = "Foo";

        expect(test_player1.hand.length).toBe(old_length + 1);
        expect(card.name).toBe("Foo");
    });
    it ('should handle `eval` debug command', () => {
        game.config.debug = true;
        game.evaling = false;

        game.interact.handleCmds("/eval game.evaling = \"true\"");

        expect(game.evaling).toBe(true);
        game.evaling = false;
    });
    it ('should handle `debug` debug command', () => {
        game.config.debug = true;

        game.interact.handleCmds("/debug");

        expect(test_player1.maxMaxMana).toBe(1000);
        expect(test_player1.maxMana).toBe(1000);
        expect(test_player1.mana).toBe(1000);

        expect(test_player1.health).toBe(10000 + test_player1.maxHealth);
        expect(test_player1.armor).toBe(100000);
        expect(test_player1.fatigue).toBe(0);
    });
    it ('should handle `exit` debug command', () => {
        game.config.debug = true;

        game.interact.handleCmds("/exit");

        expect(game.running).toBe(false);
        game.running = true;
    });
    it ('should handle invalid command', () => {
        game.config.debug = false;

        let res = game.interact.handleCmds("dsadhusadhasuhudsahuda");

        expect(res).toBe(-1);
    });

    it ('should do turn logic', () => {
        test_player1.addToHand(new Card("Sheep", test_player1));
        let res = interact.doTurnLogic("1");

        expect(res).toBeInstanceOf(Card);
        expect((res as Card).name).toBe("Sheep");
    });

    it ('should do a move', () => {
        test_player1.addToHand(new Card("Sheep", test_player1));
        test_player1.inputQueue = ["1"];
        let res = interact.doTurn();

        expect(res).toBeInstanceOf(Card);
        expect((res as Card).name).toBe("Sheep");
    });

    it ('should use a location', () => {
        let minion = summonMinion("Sheep", test_player1);
        expect(minion).toBeInstanceOf(Card);

        minion = minion as Card;
        minion.type = "Location";
        minion.cooldown = 0;

        test_player1.inputQueue = ["1"];
        let ret = interact.useLocation();

        expect(ret).toBe(true);
        expect(minion.cooldown).toBe(minion.backups.init.cooldown);
        expect(minion.getHealth()).toBe(0);
    });

    it ('should mulligan', () => {
        let minion = new Card("Sheep", test_player1);
        test_player1.shuffleIntoDeck(minion.imperfectCopy());
        minion.name = "Foo";
        test_player1.addToHand(minion);

        test_player1.inputQueue = ["1"];
        interact.mulligan(test_player1);

        expect(test_player1.hand[0].name).not.toBe("Foo");
    });

    it ('should choose one', () => {
        test_player1.inputQueue = ["2"];

        let input = interact.chooseOne("Choose one.", ["One", "Two", "Three"]);

        expect(input).toBe(1);
    });

    it ('should answer a question', () => {
        test_player1.inputQueue = ["2"];

        let input = interact.question(test_player1, "What is your favorite color?", ["Red", "Green", "Blue"]);

        expect(input).toBe("Green");
    });

    it ('should answer a yes/no question', () => {
        test_player1.inputQueue = ["yes"];

        let input = interact.yesNoQuestion(test_player1, "Foo?");

        expect(input).toBe(true);
    });

    it ('should discover a minion', () => {
        const log = console.log;
        console.log = () => {};

        let pool = game.functions.getCards().filter(c => c.type == "Minion");
        test_player1.inputQueue = ["1"];

        let card = interact.discover("Discover a minion", pool);

        console.log = log;

        expect(card).toBeInstanceOf(Card);

        card = card as Card;

        expect(card.type).toBe("Minion");
        expect(pool.map(c => c.name).includes(card.name));
    });

    it ('should select a minion', () => {
        let target = summonMinion("Sheep", test_player1);
        summonMinion("Sheep", test_player2);

        test_player1.inputQueue = ["1", "n"];

        let card = interact.selectCardTarget("Select a minion.", null, "any");

        expect(card).toBeInstanceOf(Card);

        card = card as Card;

        expect(card.type).toBe("Minion");
        expect(card).toBe(target);
    });
    it ('should select a hero', () => {
        test_player1.inputQueue = ["face"];

        let hero = interact.selectPlayerTarget("Select a minion.", null);

        expect(hero).toBe(test_player2);
    });

    it ('should get a readable card', () => {
        let target = new Card("Sheep", test_player1);

        let card = interact.getReadableCard(target, 1);

        const expected = "[1] " + chalk.cyan("{1} ") + chalk.bold("Sheep") + chalk.greenBright(" [1 / 1]") + " " + chalk.yellow("(Minion)");

        expect(card).toBe(expected);
    });
});

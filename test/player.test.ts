// Part of this code was copied from an example given by ChatGPT
import "colors";
import assert from 'assert';
import { Player, Game, Card } from "../src/internal.js";

// Setup the game / copied from the card updater
const game = new Game();
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");
game.setup(test_player1, test_player2);

game.player1 = test_player1;
game.player2 = test_player2;

game.player1.id = 0;
game.player2.id = 1;

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
        let weapon = new Card("Sheep", test_player1);
        weapon.type = "Weapon";

        let success = test_player1.setWeapon(weapon);

        assert.equal(success, true);
    });

    it ('should destroy weapon', () => {
        let weapon = new Card("Sheep", test_player1);
        weapon.type = "Weapon";

        test_player1.setWeapon(weapon);

        let success = test_player1.destroyWeapon();

        assert.equal(success, true);
        assert.notEqual(test_player1.weapon, weapon);
    });

    it ('should add attack', () => {
        let old_attack = test_player1.attack;

        let success = test_player1.addAttack(2);

        assert.equal(success, true);
        assert.equal(test_player1.attack, old_attack + 2);
    });

    it ('should add health', () => {
        test_player1.health = 28;
        let success = test_player1.addHealth(2);

        assert.equal(success, true);
        assert.equal(test_player1.health, 30);
    });
    it ('should not add health', () => {
        test_player1.health = 30;
        let success = test_player1.addHealth(2);

        assert.equal(success, true);
        assert.equal(test_player1.health, 30);
    });

    it ('should remove health', () => {
        test_player1.health = 30;
        let success = test_player1.remHealth(2);

        assert.equal(success, true);
        assert.equal(test_player1.health, 28);
    });

    it ('should get health', () => {
        test_player1.health = 30;
        let health = test_player1.getHealth();

        assert.equal(health, 30);
    });

    it ('should shuffle into deck', () => {
        game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");
        let old_deck = test_player1.deck;

        let card = new Card("Sheep", test_player1);
        let success = test_player1.shuffleIntoDeck(card);
        let same = 0;

        test_player1.deck.forEach((c, i) => {
            if (c.name == old_deck[i].name) same++;
        });

        assert.equal(success, true);
        assert.ok(same <= 10); // We allow 10/31 cards to be at the same positions.
    });

    it ('should add to bottom of deck', () => {
        game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        let card = new Card("Sheep", test_player1);
        let success = test_player1.addToBottomOfDeck(card);

        assert.equal(success, true);
        assert.equal(test_player1.deck[0].name, "Sheep");
    });

    it ('should draw card', () => {
        test_player1.deck = [new Card("Sheep", test_player1)];

        let card = test_player1.drawCard();

        if (typeof card === "number") assert.fail();
        assert.equal(card.name, "Sheep");
    });

    it ('should draw specific card', () => {
        game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        let card = new Card("Sheep", test_player1);
        test_player1.addToBottomOfDeck(card);

        let drawnCard = test_player1.drawSpecific(card);

        assert.equal(drawnCard, card);
    });

    it ('should add card to hand', () => {
        let card = new Card("Sheep", test_player1);
        card.name = "Foo";

        let success = test_player1.addToHand(card);

        assert.equal(success, true);
        assert.ok(test_player1.hand.find((c) => c.name == card.name));
    });

    it ('should remove card from hand', () => {
        let card = new Card("Sheep", test_player1);
        card.name = "Bar";

        test_player1.addToHand(card);
        let success = test_player1.removeFromHand(card);

        assert.equal(success, true);
        assert.ok(!test_player1.hand.find((c) => c.name == card.name));
    });

    it ('should set hero', () => {
        let hero = new Card("Warrior Starting Hero", test_player1);

        test_player1.setHero(hero);

        assert.equal(test_player1.hero, hero);
        assert.equal(test_player1.armor, 5);
    });

    it ('should set to starting hero', () => {
        let success = test_player1.setToStartingHero("Mage");

        assert.equal(success, true);
        assert.equal(test_player1.hero?.name, "Mage Starting Hero");
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
        let foo = "bar";

        let success = test_player1.tradeCorpses(1, () => {foo = "baz"});
        assert.equal(success, false);
        assert.equal(foo, "bar");

        test_player1.heroClass = "Death Knight";
        test_player1.corpses = 10;

        success = test_player1.tradeCorpses(1, () => {foo = "baz"});
        assert.equal(success, true);
        assert.equal(foo, "baz");
    });

    it ('should test runes', () => {
        test_player1.runes = "BFU";
        assert.equal(test_player1.testRunes("BBB"), false);

        test_player1.runes = "BBB";
        assert.equal(test_player1.testRunes("BBB"), true);

        test_player1.runes = "BFU";
        assert.equal(test_player1.testRunes("BF"), true);

        test_player1.runes = "BFU";
        assert.equal(test_player1.testRunes("BFF"), false);
    });
});

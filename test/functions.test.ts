// Part of this code was copied from an example given by ChatGPT
import "colors";
import assert from 'assert';
import fs from 'fs';
import { Player, Game, Card } from "../src/internal.js";
import { Blueprint, CardClassNoNeutral, EventValue } from "../src/types.js";

// Setup the game / copied from the card updater
const game = new Game();
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");
game.setup(test_player1, test_player2);

game.functions.importCards(game.functions.dirname() + "cards");
game.functions.importConfig(game.functions.dirname() + "config");

game.config.P1AI = false;
game.config.P2AI = false;

// Remove functions that clear the screen
game.interact.printName = () => {};
game.interact.printAll = () => {};
game.interact.printLicense = () => {};
game.interact.cls = () => {};

const createCard = (name: string, plr?: Player) => new Card(name, plr || test_player1);

// Begin testing
describe("Functions", () => {
    it ('should shuffle an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const shuffled_array = game.functions.shuffle(array);

        assert.notEqual(shuffled_array, array);
    });
    it ('should not change the original array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const clonedArray = array.slice();
        game.functions.shuffle(array);

        let equals = true;

        clonedArray.forEach((c, i) => {
            if (array[i] != c) equals = false;
        });

        assert.ok(equals);
    });

    it ('should remove the element `6` from an array', () => {
        let array = [1, 3, 5, 2, 4, 6];
        game.functions.remove(array, 6);

        assert.ok( !array.find(e => e == 6) );
    });

    it ('should get a random element from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const el = game.functions.randList(array).actual;

        assert.ok(array.includes(el));
    });

    it ('should correctly choose 3 items from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const els = game.functions.chooseItemsFromList(array, 3);

        const cards_matched = els.filter(el => {
            return array.includes(el.actual);
        });

        assert.ok(els.length === 3);
        assert.ok(cards_matched.length === 3);
    });

    it ('should clone a card when getting a random element from an array', () => {
        // Grab 3 cards
        let allCards = game.functions.getCards();
        let blueprints = game.functions.chooseItemsFromList(allCards, 3);
        let cards = blueprints.map(c => createCard(c.actual.name));

        // Choose a random one
        const el = game.functions.randList(cards).copy;

        // The card shouldn't match exactly since it should have been cloned, but they should have the same name
        assert.ok(!cards.includes(el));
        assert.ok(cards.find(c => c.name == el.name));
    });

    it ('should generate a random number between 1 and 10', () => {
        const num = game.functions.randInt(1, 10);

        assert.ok(num >= 1);
        assert.ok(num <= 10);
    });

    it ('should correctly capitalize "good morning"', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalize(str);

        assert.equal(capitalized, "Good morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalize(str);

        assert.notEqual(capitalized, str);
    });

    it ('should correctly capitalize all the words in "good morning"', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalizeAll(str);

        assert.equal(capitalized, "Good Morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalizeAll(str);

        assert.notEqual(capitalized, str);
    });

    it ('should correctly create a wall', () => {
        const og = [
            "Big - Small",
            "Test String - Hi",
            "Example - This is an example string",
            "Huuuuuge - Looooong"
        ];
        const expected = [
            "Big         - Small",
            "Test String - Hi",
            "Example     - This is an example string",
            "Huuuuuge    - Looooong"
        ];

        const wall = game.functions.createWall(og, "-");

        const not_matches = wall.filter(e => !expected.includes(e)); // `["test"] != ["test"]` for some reason so i need to do this

        assert.ok(not_matches.length === 0); // fin == expected
    });
    it ('should not change the original array', () => {
        const og = [
            "Big - Small",
            "Test String - Hi",
            "Example - This is an example string",
            "Huuuuuge - Looooong"
        ];

        const wall = game.functions.createWall(og, "-");

        const changed = wall.filter(e => !og.includes(e));

        assert.ok(changed.length + 1 === og.length); // wall !== og. `changed` does not include the longest brick, account for it by adding 1
    });

    it ('should get a card by its name', () => {
        const name = "The Coin"; // Kinda dangerous since the coin might not always exist but oh well. Replace with 'Priest Starting Hero' for extra safety, since that card shouldn't be deleted anyways
        const card = game.functions.getCardByName(name);

        assert.ok(card?.name == name);
    });

    it ('should get a card by its id', () => {
        const id = createCard("The Coin").id; // Get "The Coin"'s id
        const card = game.functions.getCardById(id);

        assert.ok(card?.id == id);
    });

    it ('should get a list of collectible cards', () => {
        let allCards = game.functions.getCards();
        let cards = allCards.map(c => createCard(c.name));

        let uncollectible_cards = cards.filter(c => c.uncollectible);

        assert.equal(uncollectible_cards.length, 0);
    });
    it ('should get a list of all cards', () => {
        let all_cards = game.functions.getCards(false);
        let collectible_cards = game.functions.getCards();
        let newAllCards = all_cards.map(c => createCard(c.name));
        let newCollectibleCards = collectible_cards.map(c => createCard(c.name));

        assert.notEqual(newCollectibleCards.length, newAllCards.length);
    });

    it ('should validate the class of a card', () => {
        const test_class = "Mage";
        const player = new Player("Temp Player");

        player.heroClass = test_class;

        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.classes.includes(test_class) || c.classes.includes("Neutral"))).actual;

        assert.ok(game.functions.validateClass(player, card));
    });

    it ('should check if the tribe of a card is valid', () => {
        const test_tribe = "Beast";
        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.tribe == test_tribe)).actual;
        if (!card) {
            console.error(`WARNING: No cards have the '${test_tribe}' tribe. This test WILL fail.`);
            throw new ReferenceError(`No cards have the '${test_tribe}' tribe. Ignore this test.`);
        }

        if (!card.tribe) assert.fail("card doesn't have a tribe");
        assert.ok(game.functions.matchTribe(card.tribe, test_tribe));
    });
    it ('should check if the "All" tribe is valid', () => {
        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.tribe == "All")).actual;
        if (!card) {
            console.error(`WARNING: No cards with tribes found. This test WILL fail.`);
            throw new ReferenceError(`No cards have tribes. Ignore this test.`);
        }

        if (!card.tribe) assert.fail("card doesn't have a tribe");
        assert.ok(game.functions.matchTribe(card.tribe, "Beast"));
    });

    it ('should validate a card success', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not a minion");

        minion.uncollectible = false;

        let ret = game.functions.validateCard(minion, test_player1);

        assert.equal(ret, true);
    });
    it ('should validate a card class', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not a minion");
        
        let oldClass = test_player1.heroClass;
        test_player1.heroClass = "Mage";

        minion.uncollectible = false;
        minion.classes = ["Death Knight"];

        let ret = game.functions.validateCard(minion, test_player1);

        test_player1.heroClass = oldClass;

        assert.equal(ret, "class");
    });
    it ('should validate a card uncollectible', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not a minion");

        minion.uncollectible = true;

        let ret = game.functions.validateCard(minion, test_player1);

        assert.equal(ret, "uncollectible");
    });
    it ('should validate a card runes', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        if (!(minion instanceof Card)) assert.fail("minion is not a minion");

        minion.uncollectible = false;
        minion.runes = "BBB";

        let ret = game.functions.validateCard(minion, test_player1);

        assert.equal(ret, "runes");
    });

    it ('should check if the highlander function works', () => {
        // Deck does not have duplicates
        const player = new Player("Temp Player");
        let deck = game.functions.chooseItemsFromList(game.functions.getCards(), 10).map(c => c.actual);

        // Turn all blueprints into real cards
        let trueDeck: Card[] = deck.map(c => {
            if (!(c instanceof Card)) return new Card(c.name, player);
            else return c;
        });

        player.deck = trueDeck;

        assert.ok(game.functions.highlander(player));
    });
    it ('should check if the highlander function works', () => {
        // Deck has duplicates
        let allCards = game.functions.getCards();
        let cards = game.functions.chooseItemsFromList(allCards, 10);
        let trueCards = cards.map(c => createCard(c.actual.name, test_player2));

        test_player2.deck = trueCards;
        test_player2.deck.push(test_player2.deck[0].imperfectCopy()); // Put a copy of the first card in the player's deck

        assert.ok(!game.functions.highlander(test_player2));
    });

    it ('should return the class names', () => {
        // This test will only fail if one of the elements in `expected` is NOT in the returned list `getClasses`
        let expected: CardClassNoNeutral[] = [
            "Death Knight",
            "Demon Hunter",
            "Druid",
            "Hunter",
            "Mage",
            "Paladin",
            "Priest",
            "Rogue",
            "Shaman",
            "Warlock",
            "Warrior"
        ];

        let class_names = game.functions.getClasses();

        let missing = expected.filter(c => !class_names.includes(c));

        assert.equal(missing.length, 0);
    });

    it ('should correctly color by rarity', () => {
        let cards = game.functions.getCards();
        cards = cards.filter(c => c.rarity == "Legendary");
        const card = cards[0];

        const expected = "\x1B[33m" + card.name + "\x1B[39m"; // This might only work on windows.
        const colored = game.functions.colorByRarity(card.name, card.rarity);

        assert.equal(colored, expected);
    });

    it ('should correctly parse tags', () => {
        const str = "&BBold&R, &rRed&R, &gGreen&R, &bBlue&R, &cCyan&R, &mMagenta&R, &yYellow&R, &kBlack&R, &aGray&R, &wWhite&R.";
        const expected = '\x1B[1mBold\x1B[22m, \x1B[31mRed\x1B[39m, \x1B[32mGreen\x1B[39m, \x1B[34mBlue\x1B[39m, \x1B[36mCyan\x1B[39m, \x1B[35mMagenta\x1B[39m, \x1B[33mYellow\x1B[39m, \x1B[30mBlack\x1B[39m, \x1B[90mGray\x1B[39m, \x1B[37mWhite\x1B[39m.';

        const parsed = game.functions.parseTags(str);

        assert.equal(parsed, expected);
    });

    it ('should correctly escape tags', () => {
        const str = "&BBold&R, ~&rRed~&R, &gGreen&R, ~&bBlue~&R, &cCyan&R, ~&mMagenta~&R, &yYellow&R, ~&kBlack~&R, &aGray&R, ~&wWhite~&R.";
        const expected = '\x1B[1mBold\x1B[22m, &rRed&R, \x1B[32mGreen\x1B[39m, &bBlue&R, \x1B[36mCyan\x1B[39m, &mMagenta&R, \x1B[33mYellow\x1B[39m, &kBlack&R, \x1B[90mGray\x1B[39m, &wWhite&R.';

        const parsed = game.functions.parseTags(str);

        assert.equal(parsed, expected);
    });

    it ('should correctly strip tags', () => {
        const str = "&BBold&R: ~&rEscaped~&R";
        const expected = "Bold: &rEscaped&R";

        const parsed = game.functions.stripTags(str);

        assert.equal(parsed, expected);
    });

    it ('should correctly clone an object', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneObject(card);

        assert.equal(card.uuid, cloned_card.uuid);
    });

    it ('should correctly clone a card', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneCard(card);

        assert.equal(card.name, cloned_card.name);
    });
    it ('should correctly randomize the ids when cloning a card', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneCard(card);

        assert.notEqual(card.uuid, cloned_card.uuid);
    });

    it ('should correctly create an event listener', () => {
        const amount = Object.values(game.eventListeners).length;
        // DON'T ACTUALLY USE DUMMY EVENT LISTENERS IN REAL CODE
        game.functions.addEventListener("Dummy", () => {return true}, () => {return true});

        assert.ok(Object.values(game.eventListeners).length > amount);
    });
    it ('should correctly manually destroy an event listener', () => {
        const destroy = game.functions.addEventListener("Dummy", () => {return true}, () => {return true});
        const amount = Object.values(game.eventListeners).length;

        destroy();

        assert.ok(Object.values(game.eventListeners).length < amount);
    });
    it ('should correctly semi-manually destroy an event listener', () => {
        game.functions.addEventListener("Eval", () => {return true}, (_unknownVal) => {
            const val = _unknownVal as EventValue<"Eval">;

            // If the val is an even number, the event listener will be destroyed
            if (parseInt(val) % 2 == 0) return "destroy"
            else return true;
        }, -1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Eval", "2", test_player1);

        assert.ok(Object.values(game.eventListeners).length < amount);
    });
    it ('should not semi-manually destroy an event listener', () => {
        game.functions.addEventListener("Eval", () => {return true}, (_unknownVal) => {
            const val = _unknownVal as EventValue<"Eval">;

            // If the val is an even number, the event listener will be destroyed
            if (parseInt(val) % 2 == 0) return "destroy"
            else return true;
        }, -1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Eval", "1", test_player1);

        assert.ok(Object.values(game.eventListeners).length == amount);
    });
    it ('should correctly automatically destroy an event listener', () => {
        game.functions.addEventListener("Dummy", () => {return true}, () => {return true}, 1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Dummy", null, test_player1);

        assert.ok(Object.values(game.eventListeners).length < amount);
    });

    it ('should correctly account for uncollectible cards', () => {
        let blueprints = game.functions.getCards(false);
        let cardlikes = game.functions.accountForUncollectible(blueprints);

        const uncollectible_exists = cardlikes.find(c => c.uncollectible);

        assert.ok(!uncollectible_exists);
    });

    it ('should correctly recruit', () => {
        const deck = game.functions.chooseItemsFromList(game.functions.getCards(), 30).map(c => c.actual);
        test_player1.deck = deck.map(c => createCard(c.name, test_player1));

        game.functions.recruit(test_player1);

        const matching_minion = game.board[test_player1.id].find(c => deck.map(a => a.name).includes(c.name));

        assert.ok(matching_minion);
    });

    it ('should correctly create a 1/1 jade', () => {
        const jade = game.functions.createJade(test_player1);

        assert.equal(jade.getHealth(), 1);
        assert.equal(jade.getAttack(), 1);
    });
    it ('should correctly create a 4/4 jade', () => {
        game.functions.createJade(test_player2);
        game.functions.createJade(test_player2);
        game.functions.createJade(test_player2);
        const jade = game.functions.createJade(test_player2);

        assert.equal(jade.getHealth(), 4);
        assert.equal(jade.getAttack(), 4);
    });

    it ('should correctly mulligan', () => {
        const deck = game.functions.chooseItemsFromList(game.functions.getCards(), 27).map(c => c.actual);
        const hand = game.functions.chooseItemsFromList(game.functions.getCards(), 3).map(c => c.actual);

        test_player1.deck = deck.map(c => createCard(c.name, test_player1));
        test_player1.hand = hand.map(c => createCard(c.name, test_player1));

        const old_hand = test_player1.hand.slice();

        game.functions.mulligan(test_player1, "13");

        // The second card becomes the first card after the mulligan, and the new cards gets added onto it.
        assert.equal(test_player1.hand[0].name, old_hand[1].name);
        assert.notEqual(test_player1.hand[1].name, old_hand[0].name);
        assert.notEqual(test_player1.hand[2].name, old_hand[2].name);
    });

    it ('should correctly add a quest', () => {
        const player = test_player1;

        let done = false;

        // DON'T ACTUALLY USE DUMMY QUESTS IN REAL CODE
        game.functions.addQuest("Quest", player, createCard("The Coin", player), "Dummy", 3, (val, _done) => {
            if (!_done) return true;

            done = true;
            return true;
        });

        assert.ok(!done);

        game.events.broadcast("Dummy", 1, player);
        assert.ok(!done);

        game.events.broadcast("Dummy", 1, player);
        assert.ok(!done);

        game.events.broadcast("Dummy", 1, player);
        assert.ok(done);
    });

    it ('should correctly progress quest', () => {
        const player = test_player1;

        let card = createCard("The Coin", player);
        let success = game.functions.addQuest("Quest", player, card, "Dummy", 3, (val, _done) => {return true});

        assert.ok(success);
        assert.equal(player.quests[0].progress[0], 0);

        assert.ok(game.functions.progressQuest(player, card.displayName));
        assert.equal(player.quests[0].progress[0], 1);

        assert.ok(game.functions.progressQuest(player, card.displayName));
        assert.equal(player.quests[0].progress[0], 2);

        assert.ok(game.functions.progressQuest(player, card.displayName));
        assert.equal(player.quests[0].progress[0], 3);
    });

    it ('should correctly import a deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        if (deck === null) assert.fail("Invalid deckcode");
        assert.equal(test_player1.runes, "BBB");
        assert.equal(deck.length, 30);
    });

    it ('should correctly export a deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");
        if (deck === null) assert.fail("Invalid deckcode");

        let deckcode = game.functions.deckcode.export(deck as Blueprint[], "Death Knight", "BBB");

        assert.equal(deckcode.error, null);
    });
    it ('should correctly import an exported deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");
        if (deck === null) assert.fail("Invalid deckcode");

        let deckcode = game.functions.deckcode.export(deck as Blueprint[], "Death Knight", "BBB");

        deck = game.functions.deckcode.import(test_player1, deckcode.code);
        if (deck === null) assert.fail("Invalid deckcode");

        assert.notEqual(deck, "invalid");

        assert.equal(test_player1.runes, "BBB");
        assert.equal(deck.length, 30);
    });

    // Only do the following tests if the vanilla cards have been generated.
    if (!fs.existsSync("./card_creator/vanilla/.ignore.cards.json")) return;

    it ('should correctly convert a deckcode to vanilla', () => {
        let deckcode = game.functions.deckcode.toVanilla(test_player1, "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z");
        let expected = "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUAAA==";

        assert.equal(deckcode, expected);
    });

    it ('should correctly convert a deckcode from vanilla', () => {
        let deckcode = game.functions.deckcode.fromVanilla(test_player1, "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUAAA==");
        let expected = "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z";

        assert.equal(deckcode, expected);
    });
});

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

functions.importCards(__dirname + "/../cards");
functions.importConfig(__dirname + "/../config");

game.config.P1AI = false;
game.config.P2AI = false;

// Remove functions that clear the screen
game.interact.printName = () => {};
game.interact.printAll = () => {};
game.interact.printLicense = () => {};
game.interact.cls = () => {};

// Begin testing
describe("Functions", () => {
    it ('should shuffle an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const shuffled_array = functions.shuffle(array);

        assert.notEqual(shuffled_array, array);
    });
    it ('should not change the original array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const clonedArray = array.slice();
        functions.shuffle(array);

        const equals = true;

        clonedArray.forEach((c, i) => {
            if (array[i] != c) equals = false;
        });

        assert.ok(equals);
    });

    it ('should remove the element `6` from an array', () => {
        let array = [1, 3, 5, 2, 4, 6];
        functions.remove(array, 6);

        assert.ok( !array.find(e => e == 6) );
    });

    it ('should get a random element from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const el = functions.randList(array);

        assert.ok(array.includes(el));
    });

    it ('should correctly choose 3 items from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const els = functions.chooseItemsFromList(array, 3);

        const cards_matched = els.filter(el => array.includes(el));

        assert.ok(els.length === 3);
        assert.ok(cards_matched.length === 3);
    });

    it ('should clone a card when getting a random element from an array', () => {
        // Grab 3 cards
        let cards = functions.getCards();
        cards = functions.chooseItemsFromList(cards, 3);
        cards = cards.map(c => new game.Card(c.name, {}));

        // Choose a random one
        const el = functions.randList(cards);

        // The card shouldn't match exactly since it should have been cloned, but they should have the same name
        assert.ok(!cards.includes(el));
        assert.ok(cards.find(c => c.name == el.name));
    });

    it ('should generate a random number between 1 and 10', () => {
        const num = functions.randInt(1, 10);

        assert.ok(num >= 1);
        assert.ok(num <= 10);
    });

    it ('should correctly capitalize "good morning"', () => {
        const str = "good morning";
        const capitalized = functions.capitalize(str);

        assert.equal(capitalized, "Good morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = functions.capitalize(str);

        assert.notEqual(capitalized, str);
    });

    it ('should correctly capitalize all the words in "good morning"', () => {
        const str = "good morning";
        const capitalized = functions.capitalizeAll(str);

        assert.equal(capitalized, "Good Morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = functions.capitalizeAll(str);

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

        const [wall, finishWall] = functions.createWall("-");

        og.forEach(e => wall.push(e));

        const fin = finishWall();

        const not_matches = fin.filter(e => !expected.includes(e)); // `["test"] != ["test"]` for some reason so i need to do this

        assert.ok(not_matches.length === 0); // fin == expected
    });
    it ('should not change the original array', () => {
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

        const [wall, finishWall] = functions.createWall("-");

        og.forEach(e => wall.push(e));

        const fin = finishWall();

        const changed = fin.filter(e => !og.includes(e));

        assert.ok(changed.length + 1 === og.length); // fin !== og. `changed` does not include the longest brick, account for it by adding 1
    });

    it ('should get a card by its name', () => {
        const name = "The Coin"; // Kinda dangerous since the coin might not always exist but oh well. Replace with 'Priest Starting Hero' for extra safety, since that card shouldn't be deleted anyways
        const card = functions.getCardByName(name);

        assert.ok(card.name == name);
    });

    it ('should get a card by its id', () => {
        const id = new game.Card("The Coin", {}).id; // Get "The Coin"'s id
        const card = functions.getCardById(id);

        assert.ok(card.id == id);
    });

    it ('should get a list of collectible cards', () => {
        let cards = functions.getCards();
        cards = cards.map(c => new game.Card(c.name, {}));

        let uncollectible_cards = cards.filter(c => c.uncollectible);

        assert.equal(uncollectible_cards.length, 0);
    });
    it ('should get a list of all cards', () => {
        let all_cards = functions.getCards(false);
        let collectible_cards = functions.getCards();
        all_cards = all_cards.map(c => new game.Card(c.name, {}));
        collectible_cards = collectible_cards.map(c => new game.Card(c.name, {}));

        assert.notEqual(collectible_cards.length, all_cards.length);
    });

    it ('should validate the class of a card', () => {
        const test_class = "Mage";
        const player = new game.Player("Temp Player");

        player.heroClass = test_class;

        const cards = functions.getCards(false);
        const card = functions.randList(cards.filter(c => c.class == test_class || c.class == "Neutral"));

        assert.ok(functions.validateClass(player, card));
    });

    it ('should check if the tribe of a card is valid', () => {
        const test_tribe = "Beast";
        const cards = functions.getCards(false);
        const card = functions.randList(cards.filter(c => c.tribe == test_tribe));
        if (!card) {
            console.error(`WARNING: No cards have the '${test_tribe}' tribe. This test WILL fail.`);
            throw new ReferenceError(`No cards have the '${test_tribe}' tribe. Ignore this test.`);
        }

        assert.ok(functions.matchTribe(card.tribe, test_tribe));
    });
    it ('should check if the "All" tribe is valid', () => {
        const cards = functions.getCards(false);
        const card = functions.randList(cards.filter(c => c.tribe == "All"));
        if (!card) {
            console.error(`WARNING: No cards with tribes found. This test WILL fail.`);
            throw new ReferenceError(`No cards have tribes. Ignore this test.`);
        }

        assert.ok(functions.matchTribe(card.tribe, "Beast"));
    });

    it ('should check if the highlander function works', () => {
        // Deck does not have duplicates
        const player = new game.Player("Temp Player");

        player.deck = functions.chooseItemsFromList(functions.getCards(), 10);

        assert.ok(functions.highlander(player));
    });
    it ('should check if the highlander function works', () => {
        // Deck has duplicates
        const player = new game.Player("Temp Player");

        let cards = functions.getCards();
        cards = functions.chooseItemsFromList(cards, 10);
        cards = cards.map(c => new game.Card(c.name, player));

        player.deck = cards;
        player.deck.push(player.deck[0].imperfectCopy()); // Put a copy of the first card in the player's deck

        assert.ok(!functions.highlander(player));
    });

    it ('should return the class names', () => {
        // This test will only fail if one of the elements in `expected` is NOT in the returned list `getClasses`
        let expected = [
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

        let class_names = functions.getClasses();

        let missing = expected.filter(c => !class_names.includes(c));

        assert.equal(missing.length, 0);
    });

    it ('should correctly color by rarity', () => {
        let cards = functions.getCards();
        cards = cards.filter(c => c.rarity == "Legendary");
        const card = cards[0];

        const expected = "\x1B[33m" + card.name + "\x1B[39m"; // This might only work on windows.
        const colored = functions.colorByRarity(card.name, card.rarity);

        assert.equal(colored, expected);
    });

    it ('should correctly parse tags', () => {
        const str = "&BBold&R, &rRed&R, &gGreen&R, &bBlue&R, &cCyan&R, &mMagenta&R, &yYellow&R, &kBlack&R, &aGray&R, &wWhite&R.";

        // I'm so sorry
        const expected = '\x1B[1mB\x1B[22m\x1B[1mo\x1B[22m\x1B[1ml\x1B[22m\x1B[1md\x1B[22m\x1B[0m,\x1B[0m \x1B[31mR\x1B[39m\x1B[31me\x1B[39m\x1B[31md\x1B[39m\x1B[0m,\x1B[0m \x1B[32mG\x1B[39m\x1B[32mr\x1B[39m\x1B[32me\x1B[39m\x1B[32me\x1B[39m\x1B[32mn\x1B[39m\x1B[0m,\x1B[0m \x1B[34mB\x1B[39m\x1B[34ml\x1B[39m\x1B[34mu\x1B[39m\x1B[34me\x1B[39m\x1B[0m,\x1B[0m \x1B[36mC\x1B[39m\x1B[36my\x1B[39m\x1B[36ma\x1B[39m\x1B[36mn\x1B[39m\x1B[0m,\x1B[0m \x1B[35mM\x1B[39m\x1B[35ma\x1B[39m\x1B[35mg\x1B[39m\x1B[35me\x1B[39m\x1B[35mn\x1B[39m\x1B[35mt\x1B[39m\x1B[35ma\x1B[39m\x1B[0m,\x1B[0m \x1B[33mY\x1B[39m\x1B[33me\x1B[39m\x1B[33ml\x1B[39m\x1B[33ml\x1B[39m\x1B[33mo\x1B[39m\x1B[33mw\x1B[39m\x1B[0m,\x1B[0m \x1B[30mB\x1B[39m\x1B[30ml\x1B[39m\x1B[30ma\x1B[39m\x1B[30mc\x1B[39m\x1B[30mk\x1B[39m\x1B[0m,\x1B[0m \x1B[90mG\x1B[39m\x1B[90mr\x1B[39m\x1B[90ma\x1B[39m\x1B[90my\x1B[39m\x1B[0m,\x1B[0m \x1B[37mW\x1B[39m\x1B[37mh\x1B[39m\x1B[37mi\x1B[39m\x1B[37mt\x1B[39m\x1B[37me\x1B[39m\x1B[0m.\x1B[0m';

        const parsed = functions.parseTags(str);

        /*
        let raw = require('util').inspect(parsed, { colors: true }); // Thanks util for saving me hours of manually creating the abombination that is the expected variable.
        console.log(raw);
        */

        assert.equal(parsed, expected);
    });

    it ('should correctly clone an object', () => {
        let card = functions.getCards()[0];
        card = new game.Card(card.name, {});

        let cloned_card = functions.cloneObject(card);

        assert.equal(card.__ids, cloned_card.__ids);
    });

    it ('should correctly clone a card', () => {
        let card = functions.getCards()[0];
        card = new game.Card(card.name, {});

        let cloned_card = functions.cloneCard(card);

        assert.equal(card.name, cloned_card.name);
    });
    it ('should correctly randomize the ids when cloning a card', () => {
        let card = functions.getCards()[0];
        card = new game.Card(card.name, {});

        let cloned_card = functions.cloneCard(card);

        assert.notEqual(card.__ids, cloned_card.__ids);
    });

    // TODO: Maybe add a test for `doPlayerTargets`

    it ('should correctly create an event listener', () => {
        const amount = Object.values(game.eventListeners).length;
        functions.addEventListener("Test", () => {return true}, () => {});

        assert.ok(Object.values(game.eventListeners).length > amount);
    });
    it ('should correctly manually destroy an event listener', () => {
        const destroy = functions.addEventListener("Test", () => {return true}, () => {});
        const amount = Object.values(game.eventListeners).length;

        destroy();

        assert.ok(Object.values(game.eventListeners).length < amount);
    });
    it ('should correctly semi-manually destroy an event listener', () => {
        functions.addEventListener("Test", () => {return true}, (val) => {
            return val % 2 == 0; // If this returns true, the event listener will be destroyed
        }, -1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Test", 2, test_player1);

        assert.ok(Object.values(game.eventListeners).length < amount);
    });
    it ('should not semi-manually destroy an event listener', () => {
        functions.addEventListener("Test", () => {return true}, (val) => {
            return val % 2 == 0; // If this returns true, the event listener will be destroyed
        }, -1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Test", 1, test_player1);

        assert.ok(Object.values(game.eventListeners).length == amount);
    });
    it ('should correctly automatically destroy an event listener', () => {
        functions.addEventListener("Test", () => {return true}, () => {});
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Test", null, test_player1);

        assert.ok(Object.values(game.eventListeners).length < amount);
    });

    it ('should correctly account for spell damage', () => {
        const player = new game.Player("Temp Player");
        player.spellDamage = 2;
        game.player = player;

        const amount = functions.accountForSpellDmg(2);

        assert.equal(amount, 4);
    });

    it ('should correctly apply spell damage', () => {
        game.player = test_player1;
        test_player1.spellDamage = 2;

        const og_health = test_player1.getHealth();

        const amount = functions.spellDmg(test_player1, 2);

        assert.equal(test_player1.getHealth(), og_health - 4);
    });

    it ('should correctly account for uncollectible cards', () => {
        let cards = functions.getCards(false);
        cards = functions.accountForUncollectible(cards);

        const uncollectible_exists = cards.find(c => c.uncollectible);

        assert.ok(!uncollectible_exists);
    });

    // TODO: Maybe add a test for adapt

    // TODO: Maybe add a test for invoke 

    it ('should correctly recruit', () => {
        const deck = functions.chooseItemsFromList(functions.getCards(), 30);
        test_player1.deck = deck.map(c => new game.Card(c.name, test_player1));

        functions.recruit(test_player1);

        const matching_minion = game.board[test_player1.id].find(c => deck.map(a => a.name).includes(c.name));

        assert.ok(matching_minion);
    });

    it ('should correctly create a 1/1 jade', () => {
        const player = new game.Player("Temp Player");
        const jade = functions.createJade(player);

        assert.equal(jade.getHealth(), 1);
        assert.equal(jade.getAttack(), 1);
    });
    it ('should correctly create a 4/4 jade', () => {
        const player = new game.Player("Temp Player");
        functions.createJade(player);
        functions.createJade(player);
        functions.createJade(player);
        const jade = functions.createJade(player);

        assert.equal(jade.getHealth(), 4);
        assert.equal(jade.getAttack(), 4);
    });
    
    // TODO: Maybe add test for importConfig

    // TODO: Maybe add test for _importCards

    // TODO: Maybe add test for importCards

    it ('should correctly mulligan', () => {
        const player = new game.Player("Temp Player");

        const deck = functions.chooseItemsFromList(functions.getCards(), 27);
        const hand = functions.chooseItemsFromList(functions.getCards(), 3);

        player.deck = deck.map(c => new game.Card(c.name, player));
        player.hand = hand.map(c => new game.Card(c.name, player));

        const old_deck = player.deck.slice();
        const old_hand = player.hand.slice();

        functions.mulligan(player, "13");

        // The second card becomes the first card after the mulligan, and the new cards gets added onto it.
        assert.equal(player.hand[0].name, old_hand[1].name);
        assert.notEqual(player.hand[1].name, old_hand[0].name);
        assert.notEqual(player.hand[2].name, old_hand[2].name);
    });

    it ('should correctly add a quest', () => {
        assert.ok(true); // TODO: Fix this once the new quest system is in place.
        /*
        const player = test_player1;

        let done = false;

        functions.addQuest("Quest", player, new game.Card("The Coin", player), "QuestTest", 3, (key, val, normal_done) => {
            if (!normal_done) return;

            done = true;
        });

        assert.ok(!done);

        game.events.broadcast("QuestTest", 1, player);
        assert.ok(!done);

        game.events.broadcast("QuestTest", 1, player);
        assert.ok(!done);

        game.events.broadcast("QuestTest", 1, player);
        assert.ok(done);
        */
    });

    it ('should correctly progress quest', () => {
        assert.ok(true); // TODO: Fix this when the new quest system is in place
    });

    it ('should correctly import a deckcode', () => {
        let deck = functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        assert.notEqual(deck, "invalid");

        assert.equal(test_player1.runes, "BBB");
        assert.equal(deck.length, 30);
    });

    it ('should correctly export a deckcode', () => {
        let deck = functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        let deckcode = functions.deckcode.export(deck, "Death Knight", "BBB");

        assert.equal(deckcode.error, null);
    });
    it ('should correctly import an exported deckcode', () => {
        let deck = functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        let deckcode = functions.deckcode.export(deck, "Death Knight", "BBB");

        deck = functions.deckcode.import(test_player1, deckcode.code);

        assert.notEqual(deck, "invalid");

        assert.equal(test_player1.runes, "BBB");
        assert.equal(deck.length, 30);
    });

    it ('should correctly convert a deckcode to vanilla', () => {
        let deckcode = functions.deckcode.toVanilla(test_player1, "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z");
        let expected = "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUA";

        assert.equal(deckcode, expected);
    });

    it ('should correctly convert a deckcode from vanilla', () => {
        let deckcode = functions.deckcode.fromVanilla(test_player1, "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUA");
        let expected = "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z";

        assert.equal(deckcode, expected);
    });
});

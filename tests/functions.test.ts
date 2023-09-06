// Part of this code was copied from an example given by ChatGPT
import fs from 'fs';
import { Player, Card, createGame } from "../src/internal";
import { Blueprint, CardClassNoNeutral, EventValue } from "../src/types";

// Setup the game / copied from the card updater
const { game, player1: test_player1, player2: test_player2 } = createGame();

game.config.P1AI = false;
game.config.P2AI = false;

game.doConfigAI();

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

        expect(shuffled_array).not.toBe(array);
    });
    it ('should not change the original array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const clonedArray = array.slice();
        game.functions.shuffle(array);

        let equals = true;

        clonedArray.forEach((c, i) => {
            if (array[i] != c) equals = false;
        });

        expect(equals).toBe(true);
    });

    it ('should remove the element `6` from an array', () => {
        let array = [1, 3, 5, 2, 4, 6];
        game.functions.remove(array, 6);

        expect(array).toEqual(expect.not.arrayContaining([6]));
    });

    it ('should get a random element from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const el = game.functions.randList(array).actual;

        expect(array).toEqual(expect.arrayContaining([el]));
    });

    it ('should correctly choose 3 items from an array', () => {
        const array = [1, 3, 5, 2, 4, 6];
        const els = game.functions.chooseItemsFromList(array, 3);

        const cards_matched = els.filter(el => {
            return array.includes(el.actual);
        });

        expect(els).toHaveLength(3);
        expect(cards_matched).toHaveLength(3);
    });

    it ('should clone a card when getting a random element from an array', () => {
        // Grab 3 cards
        let allCards = game.functions.getCards();
        let blueprints = game.functions.chooseItemsFromList(allCards, 3);
        let cards = blueprints.map(c => createCard(c.actual.name));

        // Choose a random one
        const el = game.functions.randList(cards).copy;

        // The card shouldn't match exactly since it should have been cloned, but they should have the same name
        expect(cards).toEqual(expect.not.arrayContaining([el]));
        expect(cards.map(c => c.name)).toContain(el.name);
    });

    it ('should generate a random number between 1 and 10', () => {
        const num = game.functions.randInt(1, 10);

        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
    });

    it ('should correctly capitalize "good morning"', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalize(str);

        expect(capitalized).toBe("Good morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalize(str);

        expect(capitalized).not.toBe(str);
    });

    it ('should correctly capitalize all the words in "good morning"', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalizeAll(str);

        expect(capitalized).toBe("Good Morning");
    });
    it ('should not change the original string', () => {
        const str = "good morning";
        const capitalized = game.functions.capitalizeAll(str);

        expect(capitalized).not.toBe(str);
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

        //const not_matches = wall.filter(e => !expected.includes(e)); // `["test"] != ["test"]` for some reason so i need to do this

        expect(wall).toEqual(expected);
        //assert.ok(not_matches.length === 0); // fin == expected
    });
    it ('should not change the original array', () => {
        const og = [
            "Big - Small",
            "Test String - Hi",
            "Example - This is an example string",
            "Huuuuuge - Looooong"
        ];

        const wall = game.functions.createWall(og, "-");

        expect(wall).not.toEqual(og);

        //const changed = wall.filter(e => !og.includes(e));

        //expect(changed).to.have.length(og.length - 1);
        //assert.ok(changed.length + 1 === og.length); // wall !== og. `changed` does not include the longest brick, account for it by adding 1
    });

    it ('should get a card by its name', () => {
        const name = "The Coin"; // Kinda dangerous since the coin might not always exist but oh well. Replace with 'Priest Starting Hero' for extra safety, since that card shouldn't be deleted anyways
        const card = game.functions.getCardByName(name);

        expect(card?.name).toBe(name);
    });

    it ('should get a card by its id', () => {
        const id = createCard("The Coin").id; // Get "The Coin"'s id
        const card = game.functions.getCardById(id);

        expect(card?.id).toBe(id);
    });

    it ('should get a list of collectible cards', () => {
        // The argument filters out all uncollectible cards
        let allCards = game.functions.getCards(true);
        let cards = allCards.map(c => createCard(c.name));

        let uncollectible_cards = cards.filter(c => c.uncollectible);

        expect(uncollectible_cards).toHaveLength(0);
    });
    it ('should get a list of all cards', () => {
        let all_cards = game.functions.getCards(false);
        let collectible_cards = game.functions.getCards();
        let newAllCards = all_cards.map(c => createCard(c.name));
        let newCollectibleCards = collectible_cards.map(c => createCard(c.name));

        expect(newCollectibleCards).toHaveLength(newAllCards.length);
    });

    it ('should validate the class of a card', () => {
        const test_class = "Mage";
        const player = new Player("Temp Player");

        player.heroClass = test_class;

        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.classes.includes(test_class) || c.classes.includes("Neutral"))).actual;

        expect(game.functions.validateClass(player, card)).toBe(true);
    });

    it ('should check if the tribe of a card is valid', () => {
        const test_tribe = "Beast";
        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.tribe == test_tribe)).actual;
        if (!card) {
            console.error(`WARNING: No cards have the '${test_tribe}' tribe. This test WILL fail.`);
            throw new ReferenceError(`No cards have the '${test_tribe}' tribe. Ignore this test.`);
        }

        expect(card.tribe).toBeDefined();
        expect(game.functions.matchTribe(card.tribe!, test_tribe)).toBe(true);
    });
    it ('should check if the "All" tribe is valid', () => {
        const cards = game.functions.getCards(false);
        const card = game.functions.randList(cards.filter(c => c.tribe == "All")).actual;
        if (!card) {
            console.error(`WARNING: No cards with tribes found. This test WILL fail.`);
            throw new ReferenceError(`No cards have tribes. Ignore this test.`);
        }

        expect(card.tribe).toBeDefined();
        expect(game.functions.matchTribe(card.tribe!, "Beast")).toBe(true);
    });

    it ('should validate a card success', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        expect(minion).toBeInstanceOf(Card);
        minion = minion as Card;

        minion.uncollectible = false;

        let ret = game.functions.validateCard(minion, test_player1);

        expect(ret).toBe(true);
    });
    it ('should validate a card class', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        expect(minion).toBeInstanceOf(Card);
        minion = minion as Card;
        
        let oldClass = test_player1.heroClass;
        test_player1.heroClass = "Mage";

        minion.uncollectible = false;
        minion.classes = ["Death Knight"];

        let ret = game.functions.validateCard(minion, test_player1);

        test_player1.heroClass = oldClass;

        expect(ret).toBe("class");
    });
    it ('should validate a card uncollectible', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        expect(minion).toBeInstanceOf(Card);
        minion = minion as Card;

        minion.uncollectible = true;

        let ret = game.functions.validateCard(minion, test_player1);

        expect(ret).toBe("uncollectible");
    });
    it ('should validate a card runes', () => {
        let minion = game.summonMinion(createCard("Sheep"), test_player1);
        expect(minion).toBeInstanceOf(Card);
        minion = minion as Card;

        minion.uncollectible = false;
        minion.runes = "BBB";

        let ret = game.functions.validateCard(minion, test_player1);

        expect(ret).toBe("runes");
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

        expect(game.functions.highlander(player)).toBe(true);
    });
    it ('should check if the highlander function works', () => {
        // Deck has duplicates
        let allCards = game.functions.getCards();
        let cards = game.functions.chooseItemsFromList(allCards, 10);
        let trueCards = cards.map(c => createCard(c.actual.name, test_player2));

        test_player2.deck = trueCards;
        test_player2.deck.push(test_player2.deck[0].imperfectCopy()); // Put a copy of the first card in the player's deck

        expect(game.functions.highlander(test_player2)).toBe(false);
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

        expect(missing).toHaveLength(0);
    });

    it ('should correctly color by rarity', () => {
        let cards = game.functions.getCards();
        cards = cards.filter(c => c.rarity == "Legendary");
        const card = cards[0];

        const expected = "\x1B[33m" + card.name + "\x1B[39m"; // This might only work on windows.
        const colored = game.functions.colorByRarity(card.name, card.rarity);

        expect(colored).toBe(expected);
    });

    it ('should correctly parse tags', () => {
        const str = "&BBold&R, &rRed&R, &gGreen&R, &bBlue&R, &cCyan&R, &mMagenta&R, &yYellow&R, &kBlack&R, &aGray&R, &wWhite&R.";
        const expected = '\x1B[1mBold\x1B[22m, \x1B[31mRed\x1B[39m, \x1B[32mGreen\x1B[39m, \x1B[34mBlue\x1B[39m, \x1B[36mCyan\x1B[39m, \x1B[35mMagenta\x1B[39m, \x1B[33mYellow\x1B[39m, \x1B[30mBlack\x1B[39m, \x1B[90mGray\x1B[39m, \x1B[37mWhite\x1B[39m.';

        const parsed = game.functions.parseTags(str);

        expect(parsed).toBe(expected);
    });

    it ('should correctly escape tags', () => {
        const str = "&BBold&R, ~&rRed~&R, &gGreen&R, ~&bBlue~&R, &cCyan&R, ~&mMagenta~&R, &yYellow&R, ~&kBlack~&R, &aGray&R, ~&wWhite~&R.";
        const expected = '\x1B[1mBold\x1B[22m, &rRed&R, \x1B[32mGreen\x1B[39m, &bBlue&R, \x1B[36mCyan\x1B[39m, &mMagenta&R, \x1B[33mYellow\x1B[39m, &kBlack&R, \x1B[90mGray\x1B[39m, &wWhite&R.';

        const parsed = game.functions.parseTags(str);

        expect(parsed).toBe(expected);
    });

    it ('should correctly strip tags', () => {
        const str = "&BBold&R: ~&rEscaped~&R";
        const expected = "Bold: &rEscaped&R";

        const parsed = game.functions.stripTags(str);

        expect(parsed).toBe(expected);
    });

    it ('should correctly clone an object', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneObject(card);

        // The uuid should be the same since we're using `cloneObject`, in a real situation, you would use `cloneCard`, which randomizes the uuid
        expect(card.uuid).toBe(cloned_card.uuid);
    });

    it ('should correctly clone a card', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneCard(card);

        expect(card.name).toBe(cloned_card.name);
    });
    it ('should correctly randomize the ids when cloning a card', () => {
        let blueprint = game.functions.getCards()[0];
        let card = createCard(blueprint.name);

        let cloned_card = game.functions.cloneCard(card);

        expect(card.uuid).not.toBe(cloned_card.uuid);
    });

    it ('should correctly create an event listener', () => {
        const amount = Object.values(game.eventListeners).length;
        // DON'T ACTUALLY USE DUMMY EVENT LISTENERS IN REAL CODE
        game.functions.addEventListener("Dummy", () => {return true}, () => {return true});

        expect(Object.values(game.eventListeners).length).toBeGreaterThan(amount);
    });
    it ('should correctly manually destroy an event listener', () => {
        const destroy = game.functions.addEventListener("Dummy", () => {return true}, () => {return true});
        const amount = Object.values(game.eventListeners).length;

        destroy();

        expect(Object.values(game.eventListeners).length).toBeLessThan(amount);
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

        expect(Object.values(game.eventListeners).length).toBeLessThan(amount);
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

        expect(Object.values(game.eventListeners)).toHaveLength(amount);
    });
    it ('should correctly automatically destroy an event listener', () => {
        game.functions.addEventListener("Dummy", () => {return true}, () => {return true}, 1);
        const amount = Object.values(game.eventListeners).length;

        game.events.broadcast("Dummy", null, test_player1);

        expect(Object.values(game.eventListeners).length).toBeLessThan(amount);
    });

    it ('should correctly account for uncollectible cards', () => {
        let blueprints = game.functions.getCards(false);
        let cardlikes = game.functions.accountForUncollectible(blueprints);

        const uncollectible_exists = cardlikes.find(c => c.uncollectible);

        expect(uncollectible_exists).toBeUndefined();
    });

    it ('should correctly recruit', () => {
        const deck = game.functions.chooseItemsFromList(game.functions.getCards(), 30).map(c => c.actual);
        test_player1.deck = deck.map(c => createCard(c.name, test_player1));

        game.functions.recruit(test_player1);

        const matching_minion = game.board[test_player1.id].find(c => deck.map(a => a.name).includes(c.name));

        expect(matching_minion).toBeDefined();
    });

    it ('should correctly create a 1/1 jade', () => {
        const jade = game.functions.createJade(test_player1);

        expect(jade.getHealth()).toBe(1);
        expect(jade.getAttack()).toBe(1);
    });
    it ('should correctly create a 4/4 jade', () => {
        game.functions.createJade(test_player2);
        game.functions.createJade(test_player2);
        game.functions.createJade(test_player2);
        const jade = game.functions.createJade(test_player2);

        expect(jade.getHealth()).toBe(4);
        expect(jade.getAttack()).toBe(4);
    });

    it ('should correctly mulligan', () => {
        const deck = game.functions.chooseItemsFromList(game.functions.getCards(), 27).map(c => c.actual);
        const hand = game.functions.chooseItemsFromList(game.functions.getCards(), 3).map(c => c.actual);

        test_player1.deck = deck.map(c => createCard(c.name, test_player1));
        test_player1.hand = hand.map(c => createCard(c.name, test_player1));

        const old_hand = test_player1.hand.slice();

        game.functions.mulligan(test_player1, "13");

        // The second card becomes the first card after the mulligan, and the new cards gets added onto it.
        expect(test_player1.hand.length).toBe(3);
        expect(test_player1.hand[0].name).toBe(old_hand[1].name);
        expect(test_player1.hand[1].name).toBe(old_hand[0].name);
        expect(test_player1.hand[2].name).toBe(old_hand[2].name);
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

        expect(done).toBe(false);

        game.events.broadcast("Dummy", 1, player);
        expect(done).toBe(false);

        game.events.broadcast("Dummy", 1, player);
        expect(done).toBe(false);

        game.events.broadcast("Dummy", 1, player);
        expect(done).toBe(true);
    });

    it ('should correctly progress quest', () => {
        const player = test_player1;

        let card = createCard("The Coin", player);
        let success = game.functions.addQuest("Quest", player, card, "Dummy", 3, (val, _done) => {return true});

        expect(success).toBe(true);
        expect(player.quests[0].progress[0]).toBe(0);

        expect(game.functions.progressQuest(player, card.displayName)).toBe(true);
        expect(player.quests[0].progress[0]).toBe(1);

        expect(game.functions.progressQuest(player, card.displayName)).toBe(true);
        expect(player.quests[0].progress[0]).toBe(2);

        expect(game.functions.progressQuest(player, card.displayName)).toBe(true);
        expect(player.quests[0].progress[0]).toBe(3);
    });

    it ('should correctly import a deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");

        expect(deck).not.toBeNull();
        deck = deck!;

        expect(test_player1.runes).toBe("BBB");
        expect(deck.length).toBe(30);
    });

    it ('should correctly export a deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");
        expect(deck).not.toBeNull();
        deck = deck!;

        let deckcode = game.functions.deckcode.export(deck as Blueprint[], "Death Knight", "BBB");

        expect(deckcode.error).toBeNull();
    });
    it ('should correctly import an exported deckcode', () => {
        let deck = game.functions.deckcode.import(test_player1, "Death Knight [3B] /1:8,2/ 5o,66,5f,3b,3c,3e,5x,70,52,55,56,6y,6z,59,5a,2,5v,5g,3o");
        expect(deck).not.toBeNull();
        deck = deck!;

        let deckcode = game.functions.deckcode.export(deck as Blueprint[], "Death Knight", "BBB");

        deck = game.functions.deckcode.import(test_player1, deckcode.code);
        expect(deck).not.toBeNull();

        expect(deck).not.toBe("invalid");

        expect(test_player1.runes).toBe("BBB");
        expect(deck).toHaveLength(30);
    });

    // Only do the following tests if the vanilla cards have been generated.
    if (!fs.existsSync(game.functions.dirname() + "../card_creator/vanilla/.ignore.cards.json")) return;

    it ('should correctly convert a deckcode to vanilla', () => {
        let deckcode = game.functions.deckcode.toVanilla(test_player1, "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z");
        let expected = "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUAAA==";

        expect(deckcode).toBe(expected);
    });

    it ('should correctly convert a deckcode from vanilla', () => {
        let deckcode = game.functions.deckcode.fromVanilla(test_player1, "AAEBAfHhBAiCDuCsAsLOAqeNBInmBN+iBcKlBcWlBQuhoQPq4wT04wT84wT94wSJ5ASP7QSrgAWogQXUlQWeqgUAAA==");
        let expected = "Death Knight [3B] /1:8,2/ 3c,5x,3e,5o,5f,3b,70,66,5v,59,5a,52,2,56,6y,5g,55,3o,6z";

        expect(deckcode).toBe(expected);
    });
});

delete require.cache[require.resolve("./card")];
delete require.cache[require.resolve("./player")];
delete require.cache[require.resolve("./ai")];

import * as fs from "fs";
import * as child_process from "child_process";
import * as deckstrings from "deckstrings"; // To decode vanilla deckcodes
import { Player } from "./player";
import { Card } from "./card";
import { Game } from "./game";
import { stripColors } from "colors";
import { Blueprint, CardClass, CardLike, CardRarity, EventKey, EventListenerCallback, EventListenerCheckCallback, EventValue, FunctionsValidateCardReturn, MinionTribe, QuestCallback, Target, TickHookCallback, VanillaCard } from "./types";
require("colors");

let game: Game;

/**
 * An instance of the Functions class, to be used in `DeckcodeFunctions`, for example.
 */
let self: Functions;

class DeckcodeFunctions {
    constructor() {}

    /**
     * Imports a deck using a code and put the cards into the player's deck
     * 
     * @param plr The player to put the cards into the deck of
     * @param code The deck code
     * 
     * @returns The deck
     */
    import(plr: Player, code: string): Card[] | null {
        /**
         * Cause the function to return an error
         * 
         * @param {string} error_code
         * @param {string | null} [card_name]
         *  
         * @returns {"invalid"} 
         */
        const ERROR = (error_code: string, card_name: string | null = null): null => {
            console.log("This deck is not valid!\nError Code: ".red + error_code.yellow);
            if (card_name) console.log("Specific Card that caused this error: ".red + card_name.yellow);
            game.input();
            return null;
        }

        // The code is base64 encoded, so we need to decode it
        //code = Buffer.from(code, 'base64').toString('ascii');
        //if (!code) ERROR("INVALIDB64");
        //
        let vanilla = false;

        try {
            deckstrings.decode(code); // If this doesn't crash, this is a vanilla deckcode

            vanilla = true;
        } catch (err) {}; // This isn't a vanilla code, no worries, just parse it as a hearthstone.js deckcode.

        if (vanilla) code = this.fromVanilla(plr, code);

        let runeRegex = /\[[BFU]{3}\]/; // BFU
        let altRuneRegex = /\[3[BFU]\]/; // BBB -> 3B

        let runesExists = runeRegex.test(code) || altRuneRegex.test(code);

        let sep = " /";

        if (runesExists) sep = " [";
        
        let hero = code.split(sep)[0];

        hero = hero.trim();
        code = sep[1] + code.split(sep)[1];

        if (!self.getClasses().includes(hero)) return ERROR("INVALIDHERO");

        // @ts-expect-error
        plr.heroClass = hero;

        let rune_classes = ["Death Knight"];
        let rune_class = rune_classes.includes(hero);

        const addRunes = (runes: string) => {
            if (rune_class) plr.runes = runes;
            // @ts-expect-error
            else game.input("WARNING: This deck has runes in it, but the class is ".yellow + hero.brightYellow + ". Supported classes: ".yellow + rune_classes.join(", ").brightYellow + "\n");
        }

        // Runes
        if (altRuneRegex.test(code)) {
            // [3B]
            let rune = code[2];

            code = code.slice(5);
            addRunes(rune.repeat(3));
        }
        else if (runeRegex.test(code)) {
            // [BFU]
            let runes = "";

            for (let i = 1; i <= 3; i++) {
                runes += code[i];
            }
            
            code = code.slice(6);
            addRunes(runes);
        }
        else if (rune_class) {
            // @ts-expect-error
            game.input("WARNING: This class supports runes but there are no runes in this deck. This deck's class: ".yellow + hero.brightYellow + ". Supported classes: ".yellow + rune_classes.join(", ").brightYellow + "\n");
        }

        let copyDefFormat = /\/(\d+:\d+,)*\d+\/ /;
        if (!copyDefFormat.test(code)) return ERROR("COPYDEFNOTFOUND"); // Find /3:5,2:8,1/

        let copyDef = code.split("/")[1];

        code = code.replace(copyDefFormat, "");

        let deck = code.split(",");
        let _deck = [];

        let localSettings = JSON.parse(JSON.stringify(game.config));

        let processed = 0;

        let retInvalid = false;

        copyDef.split(",").forEach(c => {
            let def = c.split(":");

            let copies = def[0];
            let times = parseInt(def[1]) || deck.length;

            let cards = deck.slice(processed, times);

            cards.forEach(c => {
                let id = parseInt(c, 36);

                let bp = self.getCardById(id);
                if (!bp) {
                    ERROR("NONEXISTANTCARD", id.toString());
                    retInvalid = true;
                    return;
                }
                let card = new Card(bp.name, plr);

                for (let i = 0; i < parseInt(copies); i++) _deck.push(card.perfectCopy());

                if (card.settings) {
                    Object.entries(card.settings).forEach(setting => {
                        let [key, val] = setting;

                        localSettings[key] = val;
                    });
                }

                let validateTest = (self.validateCard(card, plr));

                if (!localSettings.validateDecks || validateTest === true) return;

                let err;

                switch (validateTest) {
                    case "class":
                        err = "You have a card from a different class in your deck";
                        break;
                    case "uncollectible":
                        err = "You have an uncollectible card in your deck";
                        break;
                    case "runes":
                        err = "A card does not support your current runes";
                        break;
                    default:
                        err = "";
                        break;
                }
                game.input(`${err}.\nSpecific Card that caused the error: `.red + `${card.name}\n`.yellow);
                retInvalid = true;
            });

            if (retInvalid) return "invalid";

            processed += times;
        });

        let max = localSettings.maxDeckLength;
        let min = localSettings.minDeckLength;

        if ((_deck.length < min || _deck.length > max) && localSettings.validateDecks) {
            game.input("The deck needs ".red + ((min == max) ? `exactly `.red + `${max}`.yellow : `between`.red + `${min}-${max}`.yellow) + ` cards. Your deck has: `.red + `${_deck.length}`.yellow + `.\n`.red);
            return "invalid";
        }

        // Check if you have more than 2 cards or more than 1 legendary in your deck. (The numbers can be changed in the config)
        let cards = {};
        _deck.forEach(c => {
            if (!cards[c.name]) cards[c.name] = 0;
            cards[c.name]++;
        });
        Object.entries(cards).forEach(v => {
            let amount = v[1];
            let cardName = v[0];

            let errorcode;
            if (amount > localSettings.maxOfOneCard) errorcode = "normal";
            if (self.getCardByName(cardName)?.rarity == "Legendary" && amount > localSettings.maxOfOneLegendary) errorcode = "legendary";

            if (!localSettings.validateDecks || !errorcode) return;

            let err;
            switch (errorcode) {
                case "normal":
                    err = `There are more than `.red + localSettings.maxOfOneCard.toString().yellow + " of a card in your deck".red;
                    break
                case "legendary":
                    err = `There are more than `.red + localSettings.maxOfOneLegendary.toString().yellow + " of a legendary card in your deck".red;
                    break
                default:
                    err = "";
                    break;
            }
            game.input(err + "\nSpecific card that caused this error: ".red + cardName.yellow + ". Amount: ".red + amount.toString().yellow + ".\n".red);
            return "invalid";
        });
    
        _deck = self.shuffle(_deck);

        plr.deck = _deck;

        return _deck;
    }

    /**
     * Generates a deckcode from a list of blueprints
     *
     * @param deck The deck to create a deckcode from
     * @param heroClass The class of the deck. Example: "Priest"
     * @param runes The runes of the deck. Example: "BFU"
     *
     * @returns The deckcode, An error message alongside any additional information.
     */
    export(deck: Blueprint[], heroClass: string, runes: string): { code: string; error: null | { msg: string; info: any; }; } {
        let error = null;

        if (deck.length < game.config.minDeckLength) error = {"msg": "TooFewCards", "info": deck.length};
        if (deck.length > game.config.maxDeckLength) error = {"msg": "TooManyCards", "info": deck.length};

        if (deck.length <= 0) {
            // Unrecoverable error
            error = {"msg": "EmptyDeck", "info": null};

            return {"code": "", "error": error};
        }

        let deckcode = `${heroClass} `;

        if (runes) {
            // If the runes is 3 of one type, write, for example, 3B instead of BBB
            if (new Set(runes.split("")).size == 1) deckcode += `[3${runes[0]}] `;
            else deckcode += `[${runes}] `;
        }

        deckcode += "/";

        let cards = [];

        deck.forEach(c => {
            let found = cards.find(a => a[0].name == c.name);

            if (!found) cards.push([c, 1]);
            else cards[cards.indexOf(found)][1]++;
        });

        // Sort
        cards = cards.sort((a, b) => {
            return a[1] - b[1];
        });

        let lastCopy = null;
        cards.forEach(c => {
            let [card, copies] = c;

            if (copies == lastCopy) return;

            let amount = 0;
            let last = false;

            cards.forEach((c, i) => {
                if (c[1] != copies) return;
                if ((i + 1) == cards.length) last = true;

                amount++;
            });

            lastCopy = copies;

            if (last) deckcode += copies;
            else deckcode += `${copies}:${amount},`;

            if (copies > game.config.maxOfOneLegendary && card.rarity == "Legendary") error = {"msg": "TooManyLegendaryCopies", "info": {"card": card, "copies": copies}};
            else if (copies > game.config.maxOfOneCard) error = {"msg": "TooManyCopies", "info": {"card": card, "copies": copies}};
        });

        deckcode += "/ ";

        deckcode += cards.map(c => c[0].id.toString(36)).join(",");

        return {"code": deckcode, "error": error};
    }

    /**
     * Turns a Hearthstone.js deckcode into a vanilla deckcode
     *
     * @param plr The player that will get the deckcode
     * @param code The deckcode
     * @param extraFiltering If it should do extra filtering when there are more than 1 possible card. This may choose the wrong card. 
     *
     * @returns The vanilla deckcode
     */
    toVanilla(plr: Player, code: string, extraFiltering: boolean = true): string {
        // WARNING: Jank code ahead. Beware!
        //
        // Reference: Death Knight [3B] /1:4,2/ 3f,5f,6f...

        let deck: deckstrings.DeckDefinition = {"cards": [], "heroes": [], "format": 1};

        let vanillaHeroes = { // List of vanilla heroes dbfIds
            "Warrior":      7,
            "Hunter":       31,
            "Druid":        274,
            "Mage":         637,
            "Paladin":      671,
            "Priest":       813,
            "Warlock":      893,
            "Rogue":        930,
            "Shaman":       1066,
            "Demon Hunter": 56550,
            "Death Knight": 78065
        };

        let codeSplit = code.split(/[\[/]/);
        let heroClass = codeSplit[0].trim();

        let heroClassId: number = vanillaHeroes[heroClass];

        deck.heroes.push(heroClassId);

        codeSplit.splice(0, 1); // Remove the class
        if (codeSplit[0].endsWith("] ")) codeSplit.splice(0, 1); // Remove runes

        let amountStr = codeSplit[0].trim();
        let cards = codeSplit[1].trim();

        // Now it's just the cards left
        let vanillaCardsString: string;

        try {
            //@ts-expect-error
            vanillaCardsString = fs.readFileSync(__dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            console.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, run 'scripts/genvanilla.bat' (requires an internet connection), then try again.".red);
            game.input();

            process.exit(1);
        }
        let vanillaCards: VanillaCard[] = JSON.parse(vanillaCardsString);

        let cardsSplit = cards.split(",").map(i => parseInt(i, 36));
        let cardsSplitId = cardsSplit.map(i => self.getCardById(i));
        // @ts-expect-error
        let cardsSplitCard = cardsSplitId.map(c => new game.Card(c.name, plr));
        let trueCards = cardsSplitCard.map(c => c.displayName);

        // Cards is now a list of names
        let newCards = [];

        trueCards.forEach((c, i) => {
            let amount = 1;

            // Find how many copies to put in the deck
            let amountStrSplit = amountStr.split(":");

            let found = false;
            amountStrSplit.forEach((a, i2) => {
                if (found) return;
                if (i2 % 2 == 0) return; // We only want to look at every other one

                if (i >= parseInt(a)) return;

                // This is correct
                found = true;

                amount = parseInt(amountStrSplit[amountStrSplit.indexOf(a) - 1]);
            });
            if (!found) amount = parseInt(amountStr[amountStr.length - 1]);

            let matches = vanillaCards.filter(a => a.name.toLowerCase() == c.toLowerCase());
            matches = self.filterVanillaCards(matches, true, extraFiltering);

            if (matches.length == 0) {
                // Invalid card
                game.input("ERROR: Invalid card found!".red);
                return;
            }

            let match: VanillaCard;

            if (matches.length > 1) {
                // Ask the user to pick one
                matches.forEach((m, i) => {
                    delete m.elite;
                    // @ts-expect-error
                    delete m.artist;
                    // @ts-expect-error
                    delete m.collectible; // All cards here should already be collectible
                    // @ts-expect-error
                    delete m.referencedTags;
                    // @ts-expect-error
                    delete m.mechanics;
                    // @ts-expect-error
                    delete m.race; // Just look at `m.races`

                    console.log(`${i + 1}: `);
                    console.log(m);
                });

                console.log(`Multiple cards with the name '${c}' detected! Please choose one:`.yellow);
                let chosen = game.input();

                match = matches[parseInt(chosen) - 1];
            }
            else match = matches[0];

            newCards.push([match.dbfId, amount]);
        });

        deck.cards = newCards;

        let encodedDeck = deckstrings.encode(deck);
        return encodedDeck;
    }

    /**
     * Turns a vanilla deckcode into a Hearthstone.js deckcode
     *
     * @param plr The player that will get the deckcode
     * @param code The deckcode
     *
     * @returns The Hearthstone.js deckcode
     */
    fromVanilla(plr: Player, code: string): string {
        let deck: deckstrings.DeckDefinition = deckstrings.decode(code); // Use the 'deckstrings' api's decode

        let cardsString: string;

        try {
            // @ts-expect-error
            cardsString = fs.readFileSync(__dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            console.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, run 'scripts/genvanilla.bat' (requires an internet connection), then try again.".red);
            game.input();

            process.exit(1);
        }

        let cards: VanillaCard[] = JSON.parse(cardsString.toString());

        // @ts-expect-error
        delete deck.format; // We don't care about the format

        let _heroClass = cards.find(a => a.dbfId == deck.heroes[0])?.cardClass;
        let heroClass = self.capitalize(_heroClass?.toString() || game.player2.heroClass);

        if (heroClass == "Deathknight") heroClass = "Death Knight"; // Wtf hearthstone?
        if (heroClass == "Demonhunter") heroClass = "Demon Hunter"; // I'm not sure if this actually happens, but considering it happened with death knight, you never know
        
        let deckDef: (VanillaCard | undefined | number)[][] = deck.cards.map(c => [cards.find(a => a.dbfId == c[0]), c[1]]); // Get the full card object from the dbfId
        let createdCards: Blueprint[] = self.getCards(false);
        
        let invalidCards: VanillaCard[] = [];
        deckDef.forEach(c => {
            let vanillaCard = c[0];
            if (vanillaCard === undefined || typeof vanillaCard === "number") return;

            // @ts-expect-error
            if (createdCards.find(card => card.name == vanillaCard.name || card.displayName == vanillaCard.name)) return;

            // The card doesn't exist.
            console.log(`ERROR: Card '${vanillaCard.name}' doesn't exist!`.red);
            invalidCards.push(c);
        });

        if (invalidCards.length > 0) {
            // There was a card in the deck that isn't implemented in Hearthstone.js
            let createCard = game.input(`Some cards do not currently exist. You cannot play on this deck without them. Do you want to create these cards? (you will need to give the card logic yourself) [Y/N] `.yellow);

            if (createCard.toLowerCase()[0] != "y") process.exit(1);

            let vcc = require("../card_creator/vanilla/index");

            invalidCards.forEach(c => {
                // Create that card
                console.log("Creating " + c.name.yellow);
                vcc.main(c);
            });

            game.input("Press enter to try this deckcode again.\n");

            self.importCards(__dirname + "/../cards");

            return this.fromVanilla(plr, code); // Try again
        }

        let new_deck = [];

        // All cards in the deck exists
        let amounts = {};
        deckDef.forEach(c => {
            let [vanillaCard, amount] = c;
            if (vanillaCard === undefined || typeof vanillaCard === "number") return;

            // @ts-expect-error
            let name = cards.find(a => a.dbfId == vanillaCard.dbfId).name;
            // The name can still not be correct
            // @ts-expect-error
            if (!createdCards.find(a => a.name == name)) name = createdCards.find(a => a.displayName == name).name;

            new_deck.push([new game.Card(name, plr), amount]);

            if (!amounts[amount]) amounts[amount] = 0;
            amounts[amount]++;
        });

        // Sort the `new_deck` array, lowest amount first
        new_deck = new_deck.sort((a, b) => {
            return a[1] - b[1];
        });

        // Assemble Hearthstone.js deckcode.
        let deckcode = `${heroClass} `;

        // Generate runes
        let runes = "";

        if (heroClass == "Death Knight") {
            new_deck.forEach(c => {
                c = c[0];

                if (!c.runes) return;

                runes += c.runes;
            });

            let sorted_runes = "";

            if (runes.includes("B")) sorted_runes += "B";
            if (runes.includes("F")) sorted_runes += "F";
            if (runes.includes("U")) sorted_runes += "U";

            runes = runes.replace("B", "");
            runes = runes.replace("F", "");
            runes = runes.replace("U", "");

            sorted_runes += runes;

            runes = sorted_runes.slice(0, 3); // Only use the first 3 characters

            if (runes === "") runes = "3B";

            if (runes[0] == runes[1] && runes[1] == runes[2]) runes = `3${runes[0]}`;

            deckcode += `[${runes}] `;
        }

        deckcode += `/`;

        // Amount format
        Object.entries(amounts).forEach(a => {
            let [key, amount] = a;

            if (!amounts[parseInt(key) + 1]) deckcode += key; // If this is the last amount
            else deckcode += `${key}:${amount},`;
        });

        deckcode += `/ `;

        deckcode += new_deck.map(c => c[0].id.toString(36)).join(',');

        return deckcode;
    }
}

export class Functions {
    deckcode: DeckcodeFunctions;

    constructor(_game: Game) {
        /**
         * Functions related to deckcodes.
         */
        this.deckcode = new DeckcodeFunctions();

        game = _game;
        self = this; // Allow the other classes to access this class
    }

    // QoL
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    /**
     * Shuffle the array and return the result.
     * 
     * Does not change the original array.
     * 
     * @param array Array to shuffle
     * 
     * @returns Shuffled array
     */
    shuffle<T>(array: T[]): T[] {
        const newArray = [...array];
        const length = newArray.length;

        for (let start = 0; start < length; start++) {
            const randomPosition = this.randInt(0, (newArray.length - start) - 1);
            const randomItem = newArray.splice(randomPosition, 1);

            newArray.push(...randomItem);
        }

        return newArray;
    }

    /**
     * Removes `element` from `list`.
     *
     * @param list The list to remove from
     * @param element The element to remove from the list
     *
     * @returns Success
     */
    remove<T>(list: T[], element: T): boolean {
        list.splice(list.indexOf(element), 1);
        return true;
    }

    /**
     * Return a random element from `list`
     * 
     * @param list
     * @param cpyCard If this is true and the element is a card, create an imperfect copy of that card.
     * 
     * @returns Item
     */
    randList<T>(list: T[], cpyCard: boolean = true): T | Card {
        let item = list[this.randInt(0, list.length - 1)];
        
        if (item instanceof Card && cpyCard) return item.imperfectCopy();

        return item;
    }

    /**
     * Returns `amount` random items from `list`.
     *
     * @param list
     * @param amount
     * @param cpyCard If this is true and the element is a card, create an imperfect copy of that card.
     *
     * @returns The items
     */
    chooseItemsFromList<T>(list: (T | Card)[], amount: number, cpyCard: boolean = true): (T | Card)[] {
        if (amount > list.length) amount = list.length;

        list = list.slice(); // Make a copy of the list
        let elements: (T | Card)[] = [];

        for (let i = 0; i < amount; i++) {
            let el = this.randList(list, cpyCard);
            elements.push(el);
            list.splice(list.indexOf(el), 1);
        }

        return elements;
    }

    /**
     * Return a random number between `min` and `max`.
     * 
     * @param min The minimum number
     * @param max The maximum number
     * 
     * @returns The random number
     */
    randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Capitalizes a string
     * 
     * @param str String
     * 
     * @returns The string capitalized
     */
    capitalize(str: string): string {
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Capitalizes all words in string
     *
     * @param str The string
     *
     * @returns The string capitalized
     */
    capitalizeAll(str: string): string {
        return str.split(" ").map(k => this.capitalize(k)).join(" ");
    }

    /**
     * Creates a wall.
     * 
     * Walls are a formatting tool for strings, which makes them easier to read.
     * Look at the example below.
     *
     * @param bricks The array
     * @param sep The seperator.
     *  
     * @example
     * let bricks = [];
     * bricks.push('Example - Example');
     * bricks.push('Test - Hello World');
     * bricks.push('This is the longest - Short');
     * bricks.push('Tiny - This is even longer then that one!');
     * 
     * let wall = createWall(bricks, "-");
     * 
     * wall.forEach(foo => {
     *     console.log(foo);
     * });
     * // Example             - Example
     * // Test                - Hello World
     * // This is the longest - Short
     * // Tiny                - This is even longer then that one!
     * 
     * assert.equal(wall, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
     * 
     * @returns The wall
     */
    createWall(bricks: string[], sep: string): string[] {
        // Find the longest brick, most characters to the left of the seperator.

        /**
         * The longest brick
         */
        let longest_brick: [string, number] = ["", -Infinity];

        bricks.forEach(b => {
            let splitBrick = b.split(sep);

            let length = splitBrick[0].length;

            if (length <= longest_brick[1]) return;
            longest_brick = [b, length];
        });

        /**
         * The wall to return.
         */
        let wall: string[] = []

        bricks.forEach(b => {
            let splitBrick = b.split(sep);

            let strbuilder = "";
            let diff = longest_brick[1] - splitBrick[0].length;

            strbuilder += splitBrick[0];
            strbuilder += " ".repeat(diff);
            strbuilder += sep;
            strbuilder += splitBrick[1];

            wall.push(strbuilder);
        });

        return wall;
    }

    /**
     * Create a (crash)log file
     *
     * @param err If this is set, create a crash log. If this is not set, create a normal log file.
     *
     * @returns Success
     */
    createLogFile(err?: Error): boolean {
        // Create a (crash-)log file
        if (!fs.existsSync(`${__dirname}/../logs/`)) fs.mkdirSync(`${__dirname}/../logs/`);

        // Get the day, month, year, hour, minute, and second, as 2 digit numbers.
        let date = new Date();

        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString(); // Month is 0-11 for some reason
        let year = date.getFullYear().toString().slice(2); // Get the last 2 digits of the year

        let hour = date.getHours().toString();
        let minute = date.getMinutes().toString();
        let second = date.getSeconds().toString();

        if (parseInt(day) < 10) day = `0${day}`;
        if (parseInt(month) < 10) month = `0${month}`;
        if (parseInt(year) < 10) year = `0${year}`;

        if (parseInt(hour) < 10) hour = `0${hour}`;
        if (parseInt(minute) < 10) minute = `0${minute}`;
        if (parseInt(second) < 10) second = `0${second}`;

        // Assemble the time
        let dateString = `${day}/${month}/${year} ${hour}:${minute}:${second}`; // 01/01/23 23:59:59
        let dateStringFileFriendly = dateString.replace(/[/:]/g, ".").replaceAll(" ", "-"); // 01.01.23-23.59.59

        // Grab the history of the game
        // handleCmds("history", echo, debug)
        let history = game.interact.handleCmds("history", false, true);
        if (typeof history !== "string") throw new Error("createLogFile history did not return a string.");

        history = stripColors(history);

        // AI log
        game.config.debug = true; // Do this so it can actually run '/ai'
        let aiHistory = game.interact.handleCmds("/ai", false);

        let name = "Log";
        if (err) name = "Crash Log";

        let errorContent = "";

        if (err) errorContent = `
Error:
${err.stack}
`

        let history_content = `-- History --${history}`;
        let ai_content = `\n-- AI Logs --\n${aiHistory}`;

        let config = JSON.stringify(game.config, null, 2);
        let config_content = `\n-- Config --\n${config}`;

        let main_content = history_content;
        if (game.config.P1AI || game.config.P2AI) main_content += ai_content;
        main_content += config_content;
        main_content += errorContent;

        let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.config.version}-${game.config.branch}
Operating System: ${process.platform}
Log File Version: 1

${main_content}
`

        // Add a sha256 checksum to the content
        content += require("crypto").createHash("sha256").update(content).digest("hex");

        let filename = "log";
        if (err) filename = "crashlog";

        filename = `${filename}-${dateStringFileFriendly}`;

        fs.writeFileSync(`${__dirname}/../logs/${filename}.txt`, content);

        if (!err) return true;

        console.log(`\nThe game crashed!\nCrash report created in 'logs/${filename}.txt'\nPlease create a bug report at:\nhttps://github.com/LunarTides/Hearthstone.js/issues`.yellow);
        game.input();

        return true;
    }

    /**
     * Returns an AI Error with the provided information.
     *
     * @param code The function where the error occurred.
     * @param expected The expected value.
     * @param actual The actual value.
     * 
     * @returns The AI Error with the provided information.
     */
    createAIError(code: string, expected: any, actual: any): Error {
        return new Error(`AI Error: expected: ${expected}, got: ${actual}. Error Code: ${code}`);
    }

    /**
     * Filter out some useless vanilla cards
     *
     * @param cards The list of vanilla cards to filter
     * @param uncollectible If it should filter away uncollectible cards
     * @param dangerous If there are cards with a 'howToEarn' field, filter away any cards that don't have that.
     *
     * @returns The filtered cards
     * 
     * @example
     * // The numbers here are not accurate, but you get the point.
     * assert(cards.length, 21022);
     * 
     * cards = filterVanillaCards(cards, true, true);
     * assert(cards.length, 1002);
     * 
     * 
     * @example
     * // You can get a vanilla card by name using this
     * cards = cards.filter(c => c.name == "Brann Bronzebeard");
     * assert(cards.length, 15);
     * 
     * cards = filterVanillaCards(cards, true, true);
     * assert(cards.length, 1);
     */
    filterVanillaCards(cards: VanillaCard[], uncollectible: boolean = true, dangerous: boolean = false, keepHeroSkins = false): VanillaCard[] {
        if (uncollectible) cards = cards.filter(a => a.collectible); // You're welcome
        cards = cards.filter(a => !a.id.startsWith("Prologue"));
        cards = cards.filter(a => !a.id.startsWith("PVPDR")); // Idk what 'PVPDR' means, but ok
        cards = cards.filter(a => !a.id.startsWith("DRGA_BOSS"));
        cards = cards.filter(a => !a.id.startsWith("BG")); // Battlegrounds
        cards = cards.filter(a => !a.id.startsWith("TB")); // Tavern Brawl
        cards = cards.filter(a => !a.id.startsWith("LOOTA_"));
        cards = cards.filter(a => !a.id.startsWith("DALA_"));
        cards = cards.filter(a => !a.id.startsWith("GILA_"));
        cards = cards.filter(a => !a.id.startsWith("BOTA_"));
        cards = cards.filter(a => !a.id.startsWith("TRLA_"));
        cards = cards.filter(a => !a.id.startsWith("DALA_"));
        cards = cards.filter(a => !a.id.startsWith("ULDA_"));
        cards = cards.filter(a => !a.id.startsWith("BTA_BOSS_"));
        cards = cards.filter(a => !a.id.startsWith("Story_"));
        cards = cards.filter(a => !a.id.startsWith("BOM_")); // Book of mercenaries
        cards = cards.filter(a => !a.mechanics || !a.mechanics.includes("DUNGEON_PASSIVE_BUFF"));
        cards = cards.filter(a => !a.battlegroundsNormalDbfId);
        cards = cards.filter(a => a.set && !["battlegrounds", "placeholder", "vanilla", "credits"].includes(a.set.toLowerCase()));
        cards = cards.filter(a => a.set && !a.set.includes("PLACEHOLDER_"));
        cards = cards.filter(a => !a.mercenariesRole);

        let __cards = [];

        cards.forEach(a => {
            // If the set is `HERO_SKINS`, only include it if it's id is `HERO_xx`, where the x's are a number.
            if (a.set && a.set.includes("HERO_SKINS")) {
                if (keepHeroSkins && /HERO_\d\d/.test(a.id)) __cards.push(a);

                return;
            }
            __cards.push(a);
        });

        cards = __cards;
        
        if (dangerous) {
            // If any of the cards have a 'howToEarn' field, filter away any cards that don't have that
            const _cards = cards.filter(a => a.howToEarn);
            if (_cards.length > 0) cards = _cards;
        }

        return cards;
    }

    /**
     * Open a program with args
     * 
     * @param command The command/program to run
     * @param args The arguments
     * 
     * @returns Success
     * 
     * @example
     * // Opens notepad to "foo.txt" in the main folder.
     * let success = openWithArgs("notepad", "foo.txt");
     * 
     * // Wait until the user presses enter. This function automatically prints a traceback to the screen but will not pause by itself.
     * if (!success) game.input();
     */
    openWithArgs(command: string, args: string): boolean {
        // Windows vs Linux. Pros and Cons:
        if (process.platform == "win32") {
            // Windows
            child_process.exec(`start ${command} ${args}`);
        } else {
            // Linux (/ Mac)
            args = args.replaceAll("\\", "/");

            let attempts: string[] = [];

            const isCommandAvailable = (test_command: string, args_specifier: string) => {
                try {
                    console.log(`${test_command} ${args_specifier}${command} ${args}`)
                    attempts.push(test_command);

                    child_process.execSync(`which ${test_command}`);
                    child_process.exec(`${test_command} ${args_specifier}${command} ${args}`);

                    return true;
                } catch (error) {
                    return false;
                }
            }

            if (isCommandAvailable("x-terminal-emulator", "-e ")) {}
            else if (isCommandAvailable("gnome-terminal", "-- ")) {}
            else if (isCommandAvailable("xterm", "-e ")) {}
            else if (isCommandAvailable("xfce4-terminal", "--command=")) {}
            else {
                console.log("Error: Failed to open program. Traceback:");
                console.log("Operating system: Linux");
                
                attempts.forEach(a => {
                    console.log(`Tried '${a}'... failed!`);
                });

                console.log("Please install any of these using your package manager.");
                console.log("If you're not using linux, open up an issue on the github page.");
                // rl.question(); <- It is your job to pause the program when you run this, since function.ts functions should generally not pause the game.

                return false;
            }
        }

        return true;
    }

    // Getting card info

    /**
     * Returns the card with the name `name`.
     * 
     * @param name The name
     * @param refer If this should call `getCardById` if it doesn't find the card from the name
     * 
     * @returns The blueprint of the card
     */
    getCardByName(name: string | number, refer: boolean = true): Blueprint | null {
        let card = null;

        game.cards.forEach(c => {
            if (typeof name == "number") return;

            if (c.name.toLowerCase() == name.toLowerCase()) card = c;
        });

        if (!card && refer) card = this.getCardById(name, false);

        return card;
    }

    /**
     * Returns the card with the id of `id`.
     * 
     * @param id The id
     * @param refer If this should call `getCardByName` if it doesn't find the card from the id
     * 
     * @returns The blueprint of the card
     */
    getCardById(id: number | string, refer: boolean = true): Blueprint | null {
        let card = game.cards.filter(c => c.id == id)[0];

        if (!card && refer) return this.getCardByName(id.toString(), false);

        return card;
    }

    /**
     * Returns all cards added to Hearthstone.js
     *
     * @param uncollectible Filter out all uncollectible cards
     * @param cards This defaults to `game.cards`, which contains all cards in the game.
     *
     * @returns Cards
     */
    getCards(uncollectible: boolean = true, cards: Blueprint[] = game.cards): Blueprint[] {
        let _cards: Blueprint[] = [];

        cards.forEach(c => {
            if (!c.uncollectible || !uncollectible) _cards.push(c);
        });

        return _cards;
    }

    /**
     * Returns if the `card`'s class is the same as the `plr`'s class or 'Neutral'
     *
     * @param plr
     * @param card
     *
     * @returns Result
     * 
     * @example
     * assert.equal(card.class, "Mage");
     * assert.equal(plr.class, "Mage");
     * 
     * // This should return true
     * let result = validateClass(plr, card);
     * assert.equal(result, true);
     * 
     * @example
     * assert.equal(card.class, "Warrior");
     * assert.equal(plr.class, "Mage");
     * 
     * // This should return false
     * let result = validateClass(plr, card);
     * assert.equal(result, false);
     * 
     * @example
     * assert.equal(card.class, "Neutral");
     * assert.equal(plr.class, "Mage");
     * 
     * // This should return true
     * let result = validateClass(plr, card);
     * assert.equal(result, true);
     */
    validateClass(plr: Player, card: CardLike): boolean {
        return [plr.heroClass, "Neutral"].includes(card.class);
    }

    /**
     * Returns if the `card_tribe` is `tribe` or 'All'
     *
     * @param card_tribe
     * @param tribe
     * 
     * @example
     * assert.equal(card.tribe, "Beast");
     * 
     * // This should return true
     * let result = matchTribe(card.tribe, "Beast");
     * assert.equal(result, true);
     * 
     * @example
     * assert.equal(card.tribe, "All");
     * 
     * // This should return true
     * let result = matchTribe(card.tribe, "Beast");
     * assert.equal(result, true);
     */
    matchTribe(card_tribe: MinionTribe, tribe: MinionTribe): boolean {
        // If the card's tribe is "All".
        if (/all/i.test(card_tribe)) return true;
        else return card_tribe.includes(tribe);
    }

    /**
     * Checks if a card is a valid card to put into a players deck
     * 
     * @param card The card to check
     * @param plr The player to check against
     * 
     * @returns Success | Errorcode
     */
    validateCard(card: Card, plr: Player): FunctionsValidateCardReturn {
        if (!card.class.split(" / ").includes(plr.heroClass) && card.class != "Neutral") return "class";
        if (card.uncollectible) return "uncollectible";

        // Runes
        if (card.runes && !plr.testRunes(card.runes)) return "runes";

        return true;
    }

    /**
     * Returns true if the `plr`'s deck has no duplicates.
     *
     * @param plr The player to check
     *
     * @returns Highlander
     */
    highlander(plr: Player): boolean {
        let deck = plr.deck.map(c => c.name);

        return (new Set(deck)).size == deck.length;
    }

    /**
     * Returns all classes in the game
     *
     * @returns Classes
     * 
     * @example
     * let classes = getClasses();
     * 
     * assert.equal(classes, ["Mage", "Warrior", "Druid", ...])
     */
    getClasses(): Exclude<CardClass, "Neutral">[] {
        let classes: Exclude<CardClass, "Neutral">[] = [];

        fs.readdirSync(__dirname + "/../cards/StartingHeroes").forEach(file => {
            if (!file.endsWith(".ts")) return; // Something is wrong with the file name.

            let name = file.slice(0, -3); // Remove ".ts"
            name = name.replaceAll("_", " "); // Remove underscores
            name = game.functions.capitalizeAll(name); // Capitalize all words

            let card = game.functions.getCardByName(name + " Starting Hero");
            if (!card || card.class != name || card.type != "Hero" || !card["heropower"] || card.class === "Neutral") {
                console.warn("Found card in the startingheroes folder that isn't a starting hero. If the game crashes, please note this in your bug report. Name: " + name + ". Error Code: StartingHeroInvalidHandler");
                return;
            }

            classes.push(card.class);
        });

        return classes;
    }

    /**
     * Colors `str` based on `rarity`.
     *
     * @param str The string to color
     * @param rarity The rarity
     * @param bold Automatically apply bold
     *
     * @returns The colored string
     * 
     * @example
     * assert(card.rarity, "Legendary");
     * assert(card.name, "Sheep");
     * 
     * let colored = colorByRarity(card.name, card.rarity);
     * assert.equal(colored, "Sheep".yellow);
     */
    colorByRarity(str: string, rarity: CardRarity, bold: boolean = true): string {
        switch (rarity) {
            case "Common":
                str = str.gray;
                break;
            case "Rare":
                str = str.blue;
                break;
            case "Epic":
                // @ts-expect-error
                str = str.brightMagenta;
                break;
            case "Legendary":
                str = str.yellow;
                break;
            default:
                break;
        }

        // @ts-expect-error
        if (bold && rarity != "Legendary") str = str.bold;

        return str;
    }

    /**
     * Parses color tags in `str`.
     * 
     * The color tags available are:
     * 
     * ```
     * // RGB
     * 'r' = Red, 'g' = Green, 'b' = Blue
     * 
     * // CMYK
     * 'c' = Cyan, 'm' = Magenta, 'y' = Yellow, 'k' = Black
     * 
     * // Other colors
     * 'w' = White, 'a' = Gray
     * 
     * // Special
     * 'B' = Bold, 'R' = Reset
     * ```
     *
     * @param str The string to parse
     *
     * @returns The resulting string
     * 
     * @example
     * let parsed = parseTags("&BBattlecry:&R Test");
     * assert.equal(parsed, "Battlecry:".bold + " Test");
     * 
     * @example
     * // Add the `~` character to escape the tag
     * let parsed = parseTags("~&BBattlecry:~&R Test");
     * assert.equal(parsed, "&BBattlecry:&R Test");
     */
    parseTags(str: string): string {
        /**
         * Appends text styling based on the current types.
         *
         * @param c The text to be styled
         * @return The text with applied styling
         */
        const appendTypes = (c: string): string => {
            let ret = c;

            // This line fixes a bug that makes, for example, `&rTest&R.` make the `.` be red when it should be white. This bug is why all new battlecries were `&BBattlecry:&R Deal...` instead of `&BBattlecry: &RDeal...`. I will see which one i choose in the future.
            if (current_types.includes("R")) current_types = ["R"]; 

            current_types.forEach(t => {
                switch (t) {
                    case "r":
                        ret = ret.red;
                        break;
                    case "g":
                        ret = ret.green;
                        break;
                    case "b":
                        ret = ret.blue;
                        break;
                    case "c":
                        ret = ret.cyan;
                        break;
                    case "m":
                        ret = ret.magenta;
                        break;
                    case "y":
                        ret = ret.yellow;
                        break;
                    case "k":
                        ret = ret.black;
                        break;
                    case "w":
                        ret = ret.white;
                        break;
                    case "a":
                        ret = ret.gray;
                        break;

                    case "R":
                        current_types = [];

                        ret = ret.reset;
                        break;
                    case "B":
                        // @ts-expect-error
                        ret = ret.bold;
                        break;
                    case "U":
                        ret = ret.underline;
                        break;
                }
            });

            return ret;
        }

        let strbuilder = "";
        let word_strbuilder = "";
        let current_types: string[] = [];

        // Loop through the characters in str
        str.split("").forEach((c, i) => {
            // If c is not a tag
            if (c != "&") {
                if (i > 0 && str[i - 1] == "&") { // Don't add the character if a & precedes it.
                    if (i > 1 && str[i - 2] == "~") {} // But do add the character if the & has been cancelled
                    else return;
                }
                if (c == "~" && i < str.length && str[i + 1] == "&") return; // Don't add the "~" character if it is used to cancel the "&" character

                // Add the character to the current word
                word_strbuilder += c;
                return;
            }

            // c == "&"
            if (i > 0 && str[i - 1] == "~") { // If there is a `~` before the &, add the & to the string.
                word_strbuilder += c;
                return;
            }

            // New tag
            let type = str[i + 1];

            if (word_strbuilder) {
                // There is a new tag, so the word is done. Add the word to the strbuilder
                strbuilder += appendTypes(word_strbuilder);
                word_strbuilder = "";
            }

            current_types.push(type);

            if (type == "R") {
                // The type is "Reset"
                current_types = [];
            }
        });

        strbuilder += appendTypes(word_strbuilder);

        return strbuilder;
    }

    /**
     * Removes color tags from a string. Look in `functions.parseTags` for more information.
     * 
     * This only removes the TAGS, not the actual colors. Use `colors.strip` for that.
     * 
     * @example
     * let str = "&BHello&R";
     * 
     * assert.equal(stripTags(str), "Hello");
     */
    stripTags(str: string): string {
        // Regular expressions created by AI's, it removes the "&B"'s but keeps the "~&B"'s since the '~' here works like an escape character.
        // It does however remove the escape character itself.
        let strippedString = str;

        // Remove unescaped tags
        strippedString = strippedString.replace(/(?<!~)&\w/g, "")

        // Remove escape character
        strippedString = strippedString.replace(/~&(\w)/g, "&$1")

        return strippedString;
    }

    /**
     * Clones the `object`.
     * 
     * @param object The object to clone
     * 
     * @returns Clone
     */
    cloneObject<T>(object: T): T {
        return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    }

    /**
     * Creates a PERFECT copy of a card, and sets some essential properties.
     * This is the exact same as `card.perfectCopy`, so use that instead.
     * 
     * @param card The card to clone
     * 
     * @returns Clone
     */
    cloneCard(card: Card): Card {
        let clone = this.cloneObject(card);

        clone.randomizeUUID();
        clone.sleepy = true;
        clone.turn = game.turns;

        return clone;
    }

    /**
     * Calls `callback` on all `plr`'s targets, including the player itself.
     *
     * @param plr The player
     * @param callback The callback to call
     * 
     * @returns Success
     */
    doPlayerTargets(plr: Player, callback: (target: Target) => void): boolean {
        game.board[plr.id].forEach(m => {
            callback(m);
        });

        callback(plr);

        return true;
    }

    /**
     * Add an event listener.
     *
     * @param key The event to listen for. If this is an empty string, it will listen for any event.
     * @param checkCallback This will trigger when the event gets broadcast, but before the actual code in `callback`. If this returns false, the event listener will ignore the event. If you set this to `true`, it is the same as doing `() => {return true}`.
     * @param callback The code that will be ran if the event listener gets triggered and gets through `checkCallback`. If this returns true, the event listener will be destroyed.
     * @param lifespan How many times the event listener will trigger and call "callback" before self-destructing. Set this to -1 to make it last forever, or until it is manually destroyed using "callback".
     *
     * @returns If you call this function, it will destroy the event listener.
     */
    addEventListener(key: EventKey | "", checkCallback: true | EventListenerCheckCallback, callback: EventListenerCallback, lifespan: number = 1): () => void {
        let times = 0;

        let id = game.events.eventListeners;

        const remove = () => {
            delete game.eventListeners[id];
        }

        game.eventListeners[id] = (_key, _val) => {
            // Im writing it like this to make it more readable
            if (_key == key || key == "") {} // Validate key. If key is empty, match any key.
            else return;

            if (checkCallback === true || checkCallback(_val)) {}
            else return;

            let override = callback(_val);
            times++;

            if (times == lifespan || override) remove();
        }

        game.events.eventListeners++;

        return remove;
    }

    /**
     * Hooks a callback function to the tick event.
     *
     * @param callback The callback function to be hooked.
     * 
     * @returns A function that, when called, will remove the hook from the tick event.
     */
    hookToTick(callback: TickHookCallback): () => void {
        game.events.tickHooks.push(callback);

        const unhook = () => {
            this.remove(game.events.tickHooks, callback);
        }

        return unhook;
    }

    // Account for certain stats
    
    /**
     * Filters out all cards that are uncollectible in a list
     * 
     * @param cards The list of cards
     * 
     * @returns The cards without the uncollectible cards
     */
    accountForUncollectible(cards: CardLike[]): CardLike[] {
        return cards.filter(c => !c.uncollectible);
    }

    // Keyword stuff

    /**
     * Asks the user a `prompt` and show 3 choices for the player to choose, and do something to the minion based on the choice.
     * 
     * @param minion The minion to adapt
     * @param prompt The prompt to ask the user
     * @param _values DON'T TOUCH THIS UNLESS YOU KNOW WHAT YOU'RE DOING
     * 
     * @returns An array with the name of the adapt(s) chosen, or -1 if the user cancelled.
     */
    adapt(minion: Card, prompt: string = "Choose One:", _values: Card[] = []): any[] | -1 {
        const ADAPT = new Card("Adapt Helper", game.player);

        let ret = ADAPT.activate("adapt", minion, prompt, _values);
        if (ret === false) throw new Error("activate couldn't find adapt for ADAPT card.");

        return ret;
    }

    /**
     * Invoke the `plr`'s Galakrond
     * 
     * @param plr The player
     * 
     * @returns Success
     */
    invoke(plr: Player): boolean {
        // Find the card in player's deck/hand/hero that begins with "Galakrond, the "
        let deck_galakrond = plr.deck.find(c => c.displayName.startsWith("Galakrond, the "));
        let hand_galakrond = plr.hand.find(c => c.displayName.startsWith("Galakrond, the "));
        if ((!deck_galakrond && !hand_galakrond) && !plr.hero?.displayName.startsWith("Galakrond, the ")) return false;

        plr.deck.filter(c => {
            c.activate("invoke");
        });
        plr.hand.filter(c => {
            c.activate("invoke");
        });
        game.board[plr.id].forEach(c => {
            c.activate("invoke");
        });

        if (plr.hero?.displayName.startsWith("Galakrond, the ")) plr.hero.activate("heropower");
        else if (deck_galakrond) deck_galakrond.activate("heropower");
        else if (hand_galakrond) hand_galakrond.activate("heropower");

        return true;
    }

    /**
     * Chooses a minion from `list` and puts it onto the board.
     * 
     * @param plr The player
     * @param list The list to recruit from. This defaults to `plr`'s deck.
     * @param amount The amount of minions to recruit
     * 
     * @returns Returns the cards recruited
     */
    recruit(plr: Player, list?: Card[], amount: number = 1): Card[] {
        if (!list) list = plr.deck;
        let _list = list;

        list = this.shuffle(list.slice());

        let times = 0;

        let cards = [];

        list = list.filter(c => c.type == "Minion");
        list.forEach(c => {
            if (times >= amount) return;

            game.summonMinion(c.imperfectCopy(), plr);

            times++;
            cards.push(c);
        });

        cards.forEach(c => {
            this.remove(_list, c);
        });

        return cards;
    }

    /**
     * Creates and returns a jade golem with the correct stats and cost for the player
     * 
     * @param plr The jade golem's owner
     * 
     * @returns The jade golem
     */
    createJade(plr: Player): Card {
        if (plr.jadeCounter < 30) plr.jadeCounter += 1;
        const count = plr.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }

    /**
     * Imports the config from the `path` specified.
     *
     * @param path The path to import from.
     *
     * @returns Success
     */
    importConfig(path: string): boolean {
        game.config = {};

        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let c = `${path}/${file.name}`;

            if (file.name.endsWith(".json")) {
                let f = require(c);

                game.config = Object.assign({}, game.config, f);
            }
            else if (file.isDirectory()) this.importConfig(c);
        });

        game.doConfigAI();

        return true;
    }

    /**
     * USE @see {@link importCards} INSTEAD. Imports all cards from a folder.
     * 
     * @param path The path
     * 
     * @returns Success
     */
    _importCards(path: string): boolean {
        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let p = `${path}/${file.name}`;

            if (file.name.endsWith(".ts")) {
                let f = require(p);
                
                game.cards.push(f);
            }
            else if (file.isDirectory()) this._importCards(p);
        });

        return true;
    }

    /**
     * Imports all cards from a folder
     * 
     * @param path The path
     * 
     * @returns Success
     */
    importCards(path: string): boolean {
        game.cards = [];

        return this._importCards(path);
    }

    /**
     * Mulligans the cards from input. Read `interact.mulligan` for more info.
     *
     * @param plr The player who mulligans
     * @param input The ids of the cards to mulligan
     *
     * @returns The cards mulligan'd
     */
    mulligan(plr: Player, input: string): Card[] | TypeError {
        if (!parseInt(input)) return new TypeError("Can't parse `input` to int");

        let cards: Card[] = [];
        let mulligan: Card[] = [];

        input.split("").forEach(c => mulligan.push(plr.hand[parseInt(c) - 1]));

        plr.hand.forEach(c => {
            if (!mulligan.includes(c) || c.name == "The Coin") return;

            this.remove(mulligan, c);
            
            game.suppressedEvents.push("DrawCard");
            plr.drawCard();
            game.suppressedEvents.pop();

            game.suppressedEvents.push("AddCardToDeck");
            plr.shuffleIntoDeck(c);
            game.suppressedEvents.pop();

            plr.removeFromHand(c);

            cards.push(c);
        });

        return cards;
    }

    // Quest

    /**
     * Progress a quest by a value
     * 
     * @param plr The player
     * @param name The name of the quest
     * @param value The amount to progress the quest by
     * 
     * @returns The new progress
     */
    progressQuest(plr: Player, name: string, value: number = 1): number | null {
        let quest = plr.secrets.find(s => s["name"] == name);
        if (!quest) quest = plr.sidequests.find(s => s["name"] == name);
        if (!quest) quest = plr.quests.find(s => s["name"] == name);
        
        if (!quest) return null;
        quest["progress"][0] += value;

        return quest["progress"][0];
    }

    /**
     * Adds a quest / secrets to a player
     * 
     * @param type The type of the quest
     * @param plr The player to add the quest to
     * @param card The card that created the quest / secret
     * @param key The key to listen for
     * @param val The value that the quest needs
     * @param callback The function to call when the key is invoked.
     * @param next The name of the next quest / sidequest / secret that should be added when the quest is done
     * 
     * @returns {boolean} Success
     */
    addQuest(type: "Quest" | "Sidequest" | "Secret", plr: Player, card: Card, key: EventKeys, val: EventValues, callback: QuestCallback, next?: string): boolean {
        const t = plr[type.toLowerCase() + "s"];

        if ( (type.toLowerCase() == "quest" && t.length > 0) || ((type.toLowerCase() == "secret" || type.toLowerCase() == "sidequest") && (t.length >= 3 || t.filter(s => s.displayName == card.displayName).length > 0)) ) {
            plr.addToHand(card);
            //plr.mana += card.mana;
            
            return false;
        }

        plr[type.toLowerCase() + "s"].push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "next": next});
        return true;
    }
}

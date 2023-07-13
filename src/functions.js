delete require.cache[require.resolve("./card")];
delete require.cache[require.resolve("./player")];
delete require.cache[require.resolve("./ai")];

const fs = require("fs");
const child_process = require("child_process");
const deckstrings = require("deckstrings"); // To decode vanilla deckcodes
const { Player } = require("./player");
const { Card } = require("./card");
const { Game } = require("./game");
const { get } = require("./shared");
require("colors");

/**
 * @type {Game}
 */
let game = null;

/**
 * @type {Functions}
 */
let self = null;

class DeckcodeFunctions {
    constructor() {}

    /**
     * Imports a deck using a code and put the cards into the player's deck
     * 
     * @param {Player} plr The player to put the cards into the deck of
     * @param {string} code The deck code
     * 
     * @returns {Card[]} The deck
     */
    import(plr, code) {
        const ERROR = (error_code, card_name = null) => {
            game.log("This deck is not valid!\nError Code: ".red + error_code.yellow);
            if (card_name) game.log("Specific Card that caused this error: ".red + card_name.yellow);
            game.input();
            return "invalid";
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

        plr.heroClass = hero;

        let rune_classes = ["Death Knight"];
        let rune_class = rune_classes.includes(hero);

        const addRunes = (runes) => {
            if (rune_class) plr.runes = runes;
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
            game.input("WARNING: This class supports runes but there are no runes in this deck. This deck's class: ".yellow + hero.brightYellow + ". Supported classes: ".yellow + rune_classes.join(", ").brightYellow + "\n");
        }

        let copyDefFormat = /\/(\d+:\d+,)*\d+\/ /;
        if (!copyDefFormat.test(code)) return ERROR("COPYDEFNOTFOUND"); // Find /3:5,2:8,1/

        let copyDef = code.split("/")[1];

        code = code.replace(copyDefFormat, "");

        let deck = code.split(",");
        let _deck = [];

        let maxDeckLength = game.config.maxDeckLength;
        let minDeckLength = game.config.minDeckLength;

        let processed = 0;

        let retInvalid = false;

        copyDef.split(",").forEach(c => {
            c = c.split(":");

            let copies = c[0];
            let times = c[1] || deck.length;

            let cards = deck.slice(processed, times);

            cards.forEach(c => {
                c = parseInt(c, 36);

                let card = self.getCardById(c);
                if (!card) {
                    retInvalid = ERROR("NONEXISTANTCARD", c);
                    return;
                }
                card = new Card(card.name, plr);

                for (let i = 0; i < parseInt(copies); i++) _deck.push(card.perfectCopy());

                if (card.settings) {
                    if (card.settings.maxDeckSize) maxDeckLength = card.settings.maxDeckSize;
                    if (card.settings.minDeckSize) minDeckLength = card.settings.minDeckSize;
                }

                let validateTest = (self.validateCard(card, plr));

                if (!game.config.validateDecks || validateTest === true) return;

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

        let max = maxDeckLength;
        let min = minDeckLength;

        if ((_deck.length < min || _deck.length > max) && game.config.validateDecks) {
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
            let i = v[1];
            v = v[0];

            let errorcode;
            if (i > game.config.maxOfOneCard) errorcode = "normal";
            if (self.getCardByName(v).rarity == "Legendary" && i > game.config.maxOfOneLegendary) errorcode = "legendary";

            if (!game.config.validateDecks || !errorcode) return;

            let err;
            switch (errorcode) {
                case "normal":
                    err = `There are more than `.red + game.config.maxOfOneCard.toString().yellow + " of a card in your deck".red;
                    break
                case "legendary":
                    err = `There are more than `.red + game.config.maxOfOneLegendary.toString().yellow + " of a legendary card in your deck".red;
                    break
                default:
                    err = "";
                    break;
            }
            game.input(err + "\nSpecific card that caused this error: ".red + v.yellow + ". Amount: ".red + i.toString().yellow + ".\n".red);
            return "invalid";
        });
    
        _deck = self.shuffle(_deck);

        plr.deck = _deck;

        return _deck;
    }

    /**
     * Generates a deckcode from a list of blueprints
     *
     * @param {import("./card").Blueprint[]} deck The deck to create a deckcode from
     * @param {string} heroClass The class of the deck. Example: "Priest"
     * @param {string} runes The runes of the deck. Example: "BFU"
     *
     * @returns {{code: string, error: null | {msg: string, info: any}}} The deckcode, An error message alongside any additional information.
     */
    export(deck, heroClass, runes) {
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
     * @param {Player} plr The player that will get the deckcode
     * @param {string} code The deckcode
     * @param {boolean} extraFiltering If it should do extra filtering when there are more than 1 possible card. This may choose the wrong card. 
     *
     * @returns {string} The vanilla deckcode
     */
    toVanilla(plr, code, extraFiltering = true) {
        // WARNING: Jank code ahead. Beware!
        //
        // Reference: Death Knight [3B] /1:4,2/ 3f,5f,6f...

        let deck = {"cards": [], "heroes": [], "format": null};

        deck.format = deckstrings.FormatType.FT_WILD; // Wild

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

        code = code.split(/[\[/]/);
        let heroClass = code[0].trim();
        heroClass = vanillaHeroes[heroClass];

        deck.heroes.push(heroClass);

        code.splice(0, 1); // Remove the class
        if (code[0].endsWith("] ")) code.splice(0, 1); // Remove runes

        let amountStr = code[0].trim();
        let cards = code[1].trim();

        // Now it's just the cards left
        let vanillaCards;

        try {
            vanillaCards = fs.readFileSync(__dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            game.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, run 'scripts/genvanilla.bat' (requires an internet connection), then try again.".red);
            game.input();

            process.exit(1);
        }
        vanillaCards = JSON.parse(vanillaCards);

        cards = cards.split(",").map(i => parseInt(i, 36));
        cards = cards.map(i => self.getCardById(i));
        cards = cards.map(c => new game.Card(c.name, plr));
        cards = cards.map(c => c.displayName);

        // Cards is now a list of names
        let newCards = [];

        cards.forEach((c, i) => {
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

            if (!matches) {
                // Invalid card
                game.log("ERROR: Invalid card found!".red);
                game.input();
                return;
            }

            if (matches.length > 1) {
                // Ask the user to pick one
                matches.forEach((m, i) => {
                    delete m.artist;
                    delete m.elite;
                    delete m.collectible; // All cards here should already be collectible
                    delete m.referencedTags;
                    delete m.mechanics;
                    delete m.race; // Just look at `m.races`

                    game.log(`${i + 1}: `);
                    game.log(m);
                });

                game.log(`Multiple cards with the name '${c}' detected! Please choose one:`.yellow);
                let chosen = game.input();

                matches = matches[parseInt(chosen) - 1];
            }
            else matches = matches[0];

            newCards.push([matches.dbfId, amount]);
        });

        deck.cards = newCards;

        deck = deckstrings.encode(deck);
        return deck;
    }

    /**
     * Turns a vanilla deckcode into a Hearthstone.js deckcode
     *
     * @param {Player} plr The player that will get the deckcode
     * @param {string} code The deckcode
     *
     * @returns {string} The Hearthstone.js deckcode
     */
    fromVanilla(plr, code) {
        let deck = deckstrings.decode(code); // Use the 'deckstrings' api's decode

        /**
         * @type {VanillaCard[]}
         */
        let cards;

        try {
            cards = fs.readFileSync(__dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            game.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, run 'scripts/genvanilla.bat' (requires an internet connection), then try again.".red);
            game.input();

            process.exit(1);
        }
        cards = JSON.parse(cards.toString());

        delete deck.format; // We don't care about the format

        let heroClass = cards.find(a => a.dbfId == deck.heroes[0]).cardClass;
        heroClass = self.capitalize(heroClass);

        if (heroClass == "Deathknight") heroClass = "Death Knight"; // Wtf hearthstone?
        if (heroClass == "Demonhunter") heroClass = "Demon Hunter"; // I'm not sure if this actually happens, but considering it happened with death knight, you never know
        
        deck = deck.cards.map(c => [cards.find(a => a.dbfId == c[0]), c[1]]); // Get the full card object from the dbfId

        let createdCards = self.getCards(false);
        
        let invalidCards = [];
        deck.forEach(c => {
            c = c[0];

            if (createdCards.find(card => card.name == c.name || card.displayName == c.name)) return;

            // The card doesn't exist.
            game.log(`ERROR: Card '${c.name}' doesn't exist!`.red);
            invalidCards.push(c);
        });

        if (invalidCards.length > 0) {
            // There was a card in the deck that isn't implemented in Hearthstone.js
            let createCard = game.input(`Some cards do not currently exist. You cannot play on this deck without them. Do you want to create these cards? (you will need to give the card logic yourself) [Y/N] `.yellow);

            if (createCard.toLowerCase()[0] != "y") process.exit(1);

            let vcc = require("../card_creator/vanilla/index");

            invalidCards.forEach(c => {
                // Create that card
                game.log("Creating " + c.name.yellow);
                vcc.main("", c);
            });

            game.input("Press enter to try this deckcode again.\n");

            self.importCards(__dirname + "/../cards");

            return this.fromVanilla(plr, code); // Try again
        }

        let new_deck = [];

        // All cards in the deck exists
        let amounts = {};
        deck.forEach(c => {
            let name = cards.find(a => a.dbfId == c[0].dbfId).name;
            // The name can still not be correct
            if (!createdCards.find(a => a.name == name)) name = createdCards.find(a => a.displayName == name).name;

            new_deck.push([new game.Card(name, plr), c[1]]);

            if (!amounts[c[1]]) amounts[c[1]] = 0;
            amounts[c[1]]++;
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

class Functions {
    /**
     * @param {Game} _game 
     */
    constructor(_game) {
        /**
         * @type {DeckcodeFunctions}
         */
        this.deckcode = new DeckcodeFunctions();

        game = _game;
        self = this; // Allow the other classes to access this class
    }

    /**
     * Sets the game constant of the interact module.
     */
    getInternalGame() {
        game = get();
    }

    // QoL
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    /**
     * Shuffle the array and return the result
     * 
     * @param {any[]} array Array to shuffle
     * 
     * @returns {any[]} Shuffled array
     */
    shuffle(array) {
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
     * Removes `element` from `list`
     *
     * @param {any[]} list The list to remove from
     * @param {any} element The element to remove from the list
     *
     * @returns {boolean} Success
     */
    remove(list, element) {
        list.splice(list.indexOf(element), 1);
        return true;
    }

    /**
     * Return a random element from "list"
     * 
     * @param {any[]} list
     * @param {boolean} cpyCard If this is true and the element is a card, create an imperfect copy of that card.
     * 
     * @returns {any} Item
     */
    randList(list, cpyCard = true) {
        let item = list[this.randInt(0, list.length - 1)];
        
        if (item instanceof game.Card && cpyCard) item = item.imperfectCopy();

        return item;
    }

    /**
     * Returns `amount` random items from `list`.
     *
     * @param {any[]} list
     * @param {number} amount
     * @param {boolean} cpyCard If this is true and the element is a card, create an imperfect copy of that card.
     *
     * @returns {any[]} The items
     */
    chooseItemsFromList(list, amount, cpyCard = true) {
        if (amount > list.length) amount = list.length;

        list = list.slice(); // Make a copy of the list
        let elements = [];

        for (let i = 0; i < amount; i++) {
            let el = this.randList(list, cpyCard);
            elements.push(el);
            list.splice(list.indexOf(el), 1);
        }

        return elements;
    }

    /**
     * Return a random number from "min" to "max"
     * 
     * @param {number} min The minimum number
     * @param {number} max The maximum number
     * 
     * @returns {number} The random number
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Capitalizes a string
     * 
     * @param {string} str String
     * 
     * @returns {string} The string capitalized
     */
    capitalize(str) {
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Capitalizes all words in string
     *
     * @param {string} str The string
     *
     * @returns {string} The string capitalized
     */
    capitalizeAll(str) {
        return str.split(" ").map(k => this.capitalize(k)).join(" ");
    }

    /**
     * Creates a wall.
     *
     * @param {string} sep The seperator.
     *
     * @returns {[str[], wallCallback]} [wall, finishWall]
     * 
     * @callback wallCallback
     * @returns {str[]}
     * 
     * @example
     * let [wall, finishWall] = createWall("-");
     * wall.push('Example - Example');
     * wall.push('Test - Hello World');
     * wall.push('This is the longest - Short');
     * wall.push('Tiny - This is even longer then that one!');
     * 
     * let foo = finishWall();
     * 
     * foo.forEach(bar => {
     *     game.log(bar);
     * });
     * // Example             - Example
     * // Test                - Hello World
     * // This is the longest - Short
     * // Tiny                - This is even longer then that one!
     * 
     * assert.equal(foo, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
     */
    createWall(sep) {       
        let wall = [];

        const finishWall = () => {
            let longest_brick = [];

            wall.forEach(b => {
                b = b.split(sep);

                let length = b[0].length;

                if (length <= longest_brick[1]) return;

                longest_brick = [b, length];
            });

            let _wall = []

            wall.forEach(b => {
                b = b.split(sep);

                let strbuilder = "";

                let diff = longest_brick[1] - b[0].length;

                strbuilder += b[0];
                strbuilder += " ".repeat(diff);
                strbuilder += sep;
                strbuilder += b[1];

                _wall.push(strbuilder);
            });

            return _wall;
        }

        return [wall, finishWall];
    }

    /**
     * Create a (crash)log file
     *
     * @param {Error} err If this is set, create a crash report. If this is not set, create a normal log file.
     *
     * @returns {boolean} Success
     */
    createLogFile(err = null) {
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

        if (day < 10) day = `0${day}`;
        if (month < 10) month = `0${month}`;
        if (year < 10) year = `0${year}`;

        if (hour < 10) hour = `0${hour}`;
        if (minute < 10) minute = `0${minute}`;
        if (second < 10) second = `0${second}`;

        // Assemble the time
        let dateString = `${day}/${month}/${year} ${hour}:${minute}:${second}`; // 01/01/23 23:59:59
        let dateStringFileFriendly = dateString.replace(/[/:]/g, ".").replaceAll(" ", "-"); // 01.01.23-23.59.59

        // Grab the history of the game
        // handleCmds("history", write_to_screen, debug)
        let history = game.interact.handleCmds("history", false, true);

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
        let ai_content = `
-- AI Logs --
${aiHistory}`;

        let main_content = history_content;
        if (game.config.P1AI || game.config.P2AI) main_content += ai_content;
        main_content += errorContent;

        let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.config.version}-${game.config.branch}
Operating System: ${process.platform}

${main_content}
`

        let filename = "log";
        if (err) filename = "crashlog";

        filename = `${filename}-${dateStringFileFriendly}`;

        fs.writeFileSync(`${__dirname}/../logs/${filename}.txt`, content);

        if (!err) return true;

        game.log(`\nThe game crashed!\nCrash report created in 'logs/${filename}.txt'\nPlease create a bug report at:\nhttps://github.com/LunarTides/Hearthstone.js/issues`.yellow);
        game.input("", false, true);

        return true;
    }

    /**
     * Filter out some useless vanilla cards
     *
     * @param {VanillaCard[]} cards The list of vanilla cards to filter
     * @param {boolean} uncollectible If it should filter away uncollectible cards
     * @param {boolean} dangerous If there are cards with a 'howToEarn' field, filter away any cards that don't have that.
     *
     * @returns {VanillaCard[]} The filtered cards
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
    filterVanillaCards(cards, uncollectible = true, dangerous = false, keepHeroSkins = false) {
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
            const _cards = cards.filter(a => a.howToEarn);
            if (_cards.length > 0) cards = _cards;
        }

        return cards;
    }

    /**
     * Open a program with args
     * 
     * @param {string} command The command/program to run
     * @param {string} args The arguments
     * 
     * @returns {boolean} Success
     * 
     * @example
     * // Opens notepad to "foo.txt" in the main folder.
     * let success = openWithArgs("notepad", "foo.txt");
     * 
     * // Wait until the user presses enter. This function automatically prints a traceback to the screen but will not pause by itself.
     * if (!success) game.input();
     */
    openWithArgs(command, args) {
        // Windows vs Linux. Pros and Cons:
        if (process.platform == "win32") {
            // Windows
            child_process.exec(`start ${command} ${args}`);
        } else {
            // Linux (/ Mac)
            args = args.replaceAll("\\", "/");

            let attempts = [];

            const isCommandAvailable = (test_command, args_specifier) => {
                try {
                    game.log(`${test_command} ${args_specifier}${command} ${args}`)
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
                game.log("Error: Failed to open program. Traceback:");
                game.log("Operating system: Linux");
                
                attempts.forEach(a => {
                    game.log(`Tried '${a}'... failed!`);
                });

                game.log("Please install any of these using your package manager.");
                game.log("If you're not using linux, open up an issue on the github page.");
                // rl.question(); <- It is your job to pause the program when you run this, since function.js functions should generally not pause the game.

                return false;
            }
        }

        return true;
    }

    // Getting card info

    /**
     * Returns the card with the name `name`.
     * 
     * @param {string} name The name
     * @param {boolean} refer If this should call `getCardById` if it doesn't find the card from the name
     * 
     * @returns {import("./card").Blueprint} The blueprint of the card
     */
    getCardByName(name, refer = true) {
        let card;

        game.cards.forEach(c => {
            if (c.name.toLowerCase() == name.toLowerCase()) card = c;
        });

        if (!card && refer) return this.getCardById(name, false);

        return card;
    }

    /**
     * Returns the card with the id of `id`.
     * 
     * @param {number} id The id
     * @param {boolean} refer If this should call `getCardByName` if it doesn't find the card from the id
     * 
     * @returns {import("./card").Blueprint} The blueprint of the card
     */
    getCardById(id, refer = true) {
        let card = game.cards.filter(c => c.id == id)[0];

        if (!card && refer) return this.getCardByName(id.toString(), false);

        return card;
    }

    /**
     * Returns all cards added to Hearthstone.js
     *
     * @param {boolean} uncollectible Filter out all uncollectible cards
     * @param {import("./card").Blueprint[]} cards This defaults to `game.cards`, which contains all cards in the game.
     *
     * @returns {import("./card").Blueprint[]} Cards
     */
    getCards(uncollectible = true, cards = game.cards) {
        let _cards = [];

        cards.forEach(c => {
            if (!c.uncollectible || !uncollectible) _cards.push(c);
        });

        return _cards;
    }

    /**
     * Returns if the `card`'s class is the same as the `plr`'s class or 'Neutral'
     *
     * @param {Player} plr
     * @param {Card} card
     *
     * @returns {boolean} Result
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
    validateClass(plr, card) {
        return [plr.heroClass, "Neutral"].includes(card.class);
    }

    /**
     * Returns if the `card_tribe` is `tribe` or 'All'
     *
     * @param {string} card_tribe
     * @param {string} tribe
     *
     * @returns {boolean}
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
    matchTribe(card_tribe, tribe) {
        if (/all/i.test(card_tribe)) return true; // If the card's tribe is "All".

        return card_tribe.includes(tribe);
    }

    /**
     * Checks if a card is a valid card to put into a players deck
     * 
     * @param {Card} card The card to check
     * @param {Player} plr The player to check against
     * 
     * @returns {boolean | "class" | "uncollectible" | "runes"} Success | Errorcode
     */
    validateCard(card, plr) {
        if (!card.class.split(" / ").includes(plr.heroClass) && card.class != "Neutral") return "class";
        if (card.uncollectible) return "uncollectible";

        // Runes
        if (card.runes && !plr.testRunes(card.runes)) return "runes";

        return true;
    }

    /**
     * Returns true if the `plr`'s deck has no duplicates.
     *
     * @param {Player} plr The player to check
     *
     * @returns {boolean} Highlander
     */
    highlander(plr) {
        let deck = plr.deck.map(c => c.name);

        return (new Set(deck)).size == deck.length;
    }

    /**
     * Returns all classes in the game
     *
     * @returns {string[]} Classes
     * 
     * @example
     * let classes = getClasses();
     * 
     * assert.equal(classes, ["Mage", "Warrior", "Druid", ...])
     */
    getClasses() {
        let classes = [];

        fs.readdirSync(__dirname + "/../cards/StartingHeroes").forEach(file => {
            if (!file.endsWith(".js")) return; // Something is wrong with the file name.

            let name = file.slice(0, -3); // Remove ".js"
            name = name.replaceAll("_", " "); // Remove underscores
            name = game.functions.capitalizeAll(name); // Capitalize all words

            let card = game.functions.getCardByName(name + " Starting Hero");

            classes.push(card.class);
        });

        return classes;
    }

    /**
     * Colors `str` based on `rarity`.
     *
     * @param {string} str The string to color
     * @param {string} rarity The rarity
     * @param {boolean} bold Automatically apply bold
     *
     * @returns {string} The colored string
     * 
     * @example
     * assert(card.rarity, "Legendary");
     * assert(card.name, "Sheep");
     * 
     * let colored = colorByRarity(card.name, card.rarity);
     * assert.equal(colored, "Sheep".yellow);
     */
    colorByRarity(str, rarity, bold = true) {
        switch (rarity) {
            case "Common":
                str = str.gray;
                break;
            case "Rare":
                str = str.blue;
                break;
            case "Epic":
                str = str.brightMagenta;
                break;
            case "Legendary":
                str = str.yellow;
                break;
            default:
                break;
        }

        if (bold && rarity != "Legendary") str = str.bold;

        return str;
    }

    /**
     * Parses color tags in `str`.
     * 
     * The color tags available are:
     * 
     * ```
     * 'r' = Red, 'g' = Green, 'b' = Blue
     * 
     * 'c' = Cyan, 'm' = Magenta, 'y' = Yellow, 'k' = Black
     * 
     * 'w' = White, 'a' = Gray
     * 
     * 'B' = Bold, 'R' = Reset
     * ```
     *
     * @param {string} str The string to parse
     *
     * @returns {string} The resulting string
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
    parseTags(str) {
        const appendTypes = (c) => {
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
        let current_types = [];

        // Loop through the characters in str
        str.split("").forEach((c, i) => {
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
     * This only removes the TAGS, not the actual colors. Use `colors.strip` for that.
     * 
     * @example
     * let str = "&BHello&R";
     * 
     * assert.equal(stripTags(str), "Hello");
     * 
     * @param {string} str
     * 
     * @returns {string}
     */
    stripTags(str) {
        // Regular expression created by ChatGPT, it removes the "&B"'s but keeps the "~&B"'s since the '~' here works like an escape character.
        return str.replace(/(?<!~)&\w/g, "");
    }

    /**
     * Clones the `object`.
     * 
     * @param {Object} object The object to clone
     * 
     * @returns {Object} Clone
     */
    cloneObject(object) {
        return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    }

    /**
     * Creates a PERFECT copy of a card, and sets some essential properties.
     * This is the exact same as `card.perfectCopy`, so use that instead.
     * 
     * @param {Card} card The card to clone
     * 
     * @returns {Card} Clone
     */
    cloneCard(card) {
        let clone = this.cloneObject(card);

        clone.randomizeIds();
        clone.sleepy = true;
        clone.turn = game.turns;

        return clone;
    }

    /**
     * Calls `callback` on all `plr`'s targets 
     *
     * @param {Player} plr The player
     * @param {targetCallback} callback The callback to call
     * 
     * @returns {boolean} Success
     * 
     * @callback targetCallback
     * @param {Card | Player} target The target
     */
    doPlayerTargets(plr, callback) {
        game.board[plr.id].forEach(m => {
            callback(m);
        });

        callback(plr);

        return true;
    }

    /**
     * Add an event listener.
     *
     * @param {import("./game").EventKeys} key The event to listen for. If this is an empty string, it will listen for any event.
     * @param {elCallback} checkCallback This will trigger when the event gets broadcast, but before the actual code in `callback`. If this returns false, the event listener will ignore the event. If you set this to `true`, it is the same as doing `() => {return true}`.
     * @param {elCallback} callback The code that will be ran if the event listener gets triggered and gets through `checkCallback`. If this returns true, the event listener will be destroyed.
     * @param {number} lifespan How many times the event listener will trigger and call "callback" before self-destructing. Set this to -1 to make it last forever, or until it is manually destroyed using "callback".
     *
     * @returns {function} If you call this function, it will destroy the event listener.
     * 
     * @callback elCallback
     * @param {any} [val] The value of the event.
     * @returns {bool | undefined} If this returns true, destroy the event listener.
     */
    addEventListener(key, checkCallback, callback, lifespan = 1) {
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

    // Damage

    /**
     * Deals damage to `target` based on your spell damage
     * 
     * @param {Card | Player} target The target
     * @param {number} damage The damage to deal
     * 
     * @returns {boolean} Success
     */
    spellDmg(target, damage) {
        const dmg = this.accountForSpellDmg(damage);

        game.events.broadcast("SpellDealsDamage", [target, dmg], game.player);
        game.attack(dmg, target);

        return true;
    }

    // Account for certain stats

    /**
     * Returns `damage` + The current player's spell damage
     * 
     * @param {number} damage
     * 
     * @returns {number} Damage + spell damage
     */
    accountForSpellDmg(damage) {
        return damage + game.player.spellDamage;
    }

    /**
     * Filters out all cards that are uncollectible in a list
     * 
     * @param {Card[] | import("./card").Blueprint[]} cards The list of cards
     * 
     * @returns {Card[] | import("./card").Blueprint[]} The cards without the uncollectible cards
     */
    accountForUncollectible(cards) {
        return cards.filter(c => !c.uncollectible);
    }

    // Keyword stuff

    /**
     * Asks the user a `prompt` and show 3 choices for the player to choose, and do something to the minion based on the choice.
     * 
     * @param {Card} minion The minion to adapt
     * @param {string} prompt The prompt to ask the user
     * @param {Card[]} _values DON'T TOUCH THIS UNLESS YOU KNOW WHAT YOU'RE DOING
     * 
     * @returns {string} The name of the adapt chosen.
     */
    adapt(minion, prompt = "Choose One:", _values = []) {
        const ADAPT = new game.Card("Adapt Helper", game.player);

        return ADAPT.activate("adapt", minion, prompt, _values);
    }

    /**
     * Invoke the `plr`'s Galakrond
     * 
     * @param {Player} plr The player
     * 
     * @returns {boolean} Success
     */
    invoke(plr) {
        // Find the card in player's deck/hand/hero that begins with "Galakrond, the "
        let deck_galakrond = plr.deck.find(c => c.displayName.startsWith("Galakrond, the "));
        let hand_galakrond = plr.hand.find(c => c.displayName.startsWith("Galakrond, the "));
        if ((!deck_galakrond && !hand_galakrond) && !plr.hero.displayName.startsWith("Galakrond, the ")) return false;

        plr.deck.filter(c => {
            c.activate("invoke");
        });
        plr.hand.filter(c => {
            c.activate("invoke");
        });
        game.board[plr.id].forEach(c => {
            c.activate("invoke");
        });

        if (plr.hero.displayName.startsWith("Galakrond, the ")) plr.hero.activate("heropower");
        else if (deck_galakrond) deck_galakrond.activate("heropower");
        else if (hand_galakrond) hand_galakrond.activate("heropower");

        return true;
    }

    /**
     * Chooses a minion from `list` and puts it onto the board.
     * 
     * @param {Player} plr The player
     * @param {Card[]} list The list to recruit from. This defaults to `plr`'s deck.
     * @param {number} amount The amount of minions to recruit
     * 
     * @returns {Card[]} Returns the cards recruited
     */
    recruit(plr, list = null, amount = 1) {
        if (list == null) list = plr.deck;
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
     * @param {Player} plr The jade golem's owner
     * 
     * @returns {Card} The jade golem
     */
    createJade(plr) {
        if (plr.jadeCounter < 30) plr.jadeCounter += 1;
        const count = plr.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new game.Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }

    /**
     * Imports the config from the `path` specified.
     *
     * @param {string} path The path to import from.
     *
     * @returns {boolean} Success
     */
    importConfig(path) {
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
     * @param {string} path The path
     * 
     * @returns {boolean} Success
     */
    _importCards(path) {
        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let p = `${path}/${file.name}`;

            if (file.name.endsWith(".js")) {
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
     * @param {string} path The path
     * 
     * @returns {boolean} Success
     */
    importCards(path) {
        game.cards = [];

        return this._importCards(path);
    }

    /**
     * Mulligans the cards from input. Read `interact.mulligan` for more info.
     *
     * @param {Player} plr The player who mulligans
     * @param {String} input The ids of the cards to mulligan
     *
     * @returns {Card[] | TypeError} The cards mulligan'd
     */
    mulligan(plr, input) {
        if (!parseInt(input)) return new TypeError("Can't parse `input` to int");

        let cards = [];
        let mulligan = [];

        input.split("").forEach(c => mulligan.push(plr.hand[parseInt(c) - 1]));

        plr.hand.forEach(c => {
            if (!mulligan.includes(c) || c.name == "The Coin") return;

            this.remove(mulligan, c);
            
            plr.drawCard(false);
            plr.shuffleIntoDeck(c, false);
            plr.removeFromHand(c);

            cards.push(c);
        });

        return cards;
    }

    // Quest

    /**
     * Progress a quest by a value
     * 
     * @param {string} name The name of the quest
     * @param {number} value The amount to progress the quest by
     * 
     * @returns {number} The new progress
     */
    progressQuest(name, value = 1) {
        let quest = game.player.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.player.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.player.quests.find(s => s["name"] == name);

        quest["progress"][0] += value;

        return quest["progress"][0];
    }

    /**
     * Adds a quest / secrets to a player
     * 
     * @param {"Quest" | "Sidequest" | "Secret"} type The type of the quest
     * @param {Player} plr The player to add the quest to
     * @param {Card} card The card that created the quest / secret
     * @param {import("./game").EventKeys} key The key to listen for
     * @param {any} val The value that the quest needs
     * @param {import("./types").QuestCallback} callback The function to call when the key is invoked.
     * @param {string} [next=null] The name of the next quest / sidequest / secret that should be added when the quest is done
     * 
     * @returns {bool} Success
     */
    addQuest(type, plr, card, key, val, callback, next = null) {
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

exports.Functions = Functions;

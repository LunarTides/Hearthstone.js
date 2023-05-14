const fs = require("fs");
const deckstrings = require("deckstrings"); // To decode vanilla deckcodes
const { exit } = require("process");
const { setup_ai } = require("./ai");
const { setup_card } = require("./card");
const { setup_player } = require("./player");

let game = null;
let self = null;

class DeckcodeFunctions {
    constructor() {}

    import(plr, code) {
        /**
         * Imports a deck using a code and put the cards into the player's deck
         * 
         * @param {Player} plr The player to put the cards into
         * @param {string} code The base64 encoded deck code
         * 
         * @returns {Card[]} The deck
         */

        const ERROR = (error_code, card_name = null) => {
            console.log("This deck is not valid!\nError Code: ".red + error_code.yellow);
            if (card_name) console.log("Specific Card that caused this error: ".red + card_name.yellow);
            game.input();
            return "invalid";
        }

        // The code is base64 encoded, so we need to decode it
        //code = Buffer.from(code, 'base64').toString('ascii');
        //if (!code) ERROR("INVALIDB64");
        //
        try {
            deckstrings.decode(code); // If this doesn't crash, this is a vanilla deckcode

            code = this.deckcode.fromVanilla(plr, code);
        } catch (err) {}; // This isn't a vanilla code, no worries, just parse it as a hearthstone.js deckcode.

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
                card = new game.Card(card.name, plr);

                for (let i = 0; i < parseInt(copies); i++) _deck.push(card.perfectCopy());

                if (card.settings) {
                    if (card.settings.maxDeckSize) maxDeckLength = card.settings.maxDeckSize;
                    if (card.settings.minDeckSize) minDeckLength = card.settings.minDeckSize;
                }

                let validateTest = (game.interact.validateCard(card, plr));

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
    export(deck, heroClass, runes) {
        /*
         * Generates a deckcode from a list of blueprints
         *
         * @param {Blueprint[]} deck The deck to create a deckcode from
         * @param {string} heroClass The class of the deck. Example: "Priest"
         * @param {string} runes The runes of the deck. Example: "BFU"
         *
         * @returns {Object<code: string, error: Object<msg: string, info: any> | null>} The deckcode, An error message alongside any additional information.
         */

        let error = null;

        if (deck.length < game.config.minDeckLength) error = {"msg": "TooFewCards", "info": deck.length};
        if (deck.length > game.config.maxDeckLength) error = {"msg": "TooManyCards", "info": deck.length};

        if (deck.length <= 0) {
            // Unrecoverable error
            error = {"msg": "EmptyDeck", "info": null};

            return {"code": "", "error": error};
        }

        // Find the class
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
    toVanilla(plr, code) {
        /**
         * Turns a Hearthstone.js deckcode into a vanilla deckcode
         *
         * @param {Player} plr The player that will get the deckcode
         * @param {string} code The deckcode
         *
         * @returns {string} The vanilla deckcode
         */

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
            vanillaCards = fs.readFileSync(game.dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            console.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, go to 'card_creator/vanilla/' and open 'generate.bat', then try again.".red);
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
            matches = matches.filter(a => a.collectible); // You're welcome
            matches = matches.filter(a => !a.id.includes("Prologue"));
            matches = matches.filter(a => !a.id.includes("PVPDR")); // Idk what 'PVPDR' means, but ok
            matches = matches.filter(a => a.set && !["battlegrounds", "hero_skins", "placeholder"].includes(a.set.toLowerCase()));

            if (!matches) {
                // Invalid card
                console.log("ERROR: Invalid card found!".red);
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

                    console.log(`${i + 1}: `);
                    console.log(m);
                });

                console.log(`Multiple cards with the name '${c}' detected! Please choose one:`.yellow);
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
    fromVanilla(plr, code) {
        /**
         * Turns a vanilla deckcode into a Hearthstone.js deckcode
         *
         * @param {Player} plr The player that will get the deckcode
         * @param {string} code The deckcode
         *
         * @returns {string} The Hearthstone.js deckcode
         */
        let deck = deckstrings.decode(code); // Use the 'deckstrings' api's decode

        let cards;

        try {
            cards = fs.readFileSync(game.dirname + "/../card_creator/vanilla/.ignore.cards.json");
        } catch (err) {
            console.log("ERROR: It looks like you were attempting to parse a vanilla deckcode. In order for the program to support this, go to 'card_creator/vanilla/' and open 'generate.bat', then try again.".red);
            game.input();

            process.exit(1);
        }
        cards = JSON.parse(cards);

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
            console.log(`ERROR: Card '${c.name}' doesn't exist!`.red);
            invalidCards.push(c);
        });

        if (invalidCards.length > 0) {
            // There was a card in the deck that isn't implemented in Hearthstone.js
            let createCard = game.input(`Some cards do not currently exist. You cannot play on this deck without them. Do you want to create these cards? (you will need to give the card logic yourself) [Y/N] `.yellow);

            if (createCard.toLowerCase()[0] != "y") process.exit(1);

            let vcc = require("./../card_creator/vanilla/index");

            invalidCards.forEach(c => {
                // Create that card
                console.log("Creating " + c.name.yellow);
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
    constructor(_game) {
        this.deckcode = new DeckcodeFunctions();

        game = _game;
        self = this; // Allow the other classes to access this class
    }

    // QoL
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    shuffle(array) {
        /**
         * Shuffle the array and return the result
         * 
         * @param {any[]} array Array to shuffle
         * 
         * @returns {any[]} Shuffeled array
         */

        const newArray = [...array];
        const length = newArray.length;

        for (let start = 0; start < length; start++) {
            const randomPosition = this.randInt(0, (newArray.length - start) - 1);
            const randomItem = newArray.splice(randomPosition, 1);

            newArray.push(...randomItem);
        }

        return newArray;
    }
    remove(list, element) {
        /**
         * Removes "element" from "list"
         *
         * @param {any[]} list The list to remove from
         * @param {any} element The element to remove from the list
         *
         * @returns {null}
         */
        list.splice(list.indexOf(element), 1);
    }
    randList(list, cpyCard = true) {
        /**
         * Return a random element from "list"
         * 
         * @param {any[]} list
         * 
         * @returns {any} Item
         */

        let item = list[this.randInt(0, list.length - 1)];
        
        if (item instanceof game.Card && cpyCard) item = item.imperfectCopy();

        return item;
    }
    chooseItemsFromList(list, amount, cpyCard = true) {
        /**
         * Returns "amount" random items from the list.
         *
         * @param {any[]} list
         * @param {number} amount
         * @param {bool} cpyCard If this is on and the element is a card, create an imperfect copy of that card.
         *
         * @returns {any[]} The items
         */
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
    randInt(min, max) {
        /**
         * Return a random number from "min" to "max"
         * 
         * @param {number} min The minimum number
         * @param {number} max The maximum number
         * 
         * @returns {number} The random number
         */

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    capitalize(str) {
        /**
         * Capitalizes and returns the string
         * 
         * @param {string} str String
         * 
         * @returns {string} The string capitilized
         */

        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }
    capitalizeAll(str) {
        /**
         * Capitalizes all words in string and returns it
         *
         * @param {string} str The string
         *
         * @returns {string} The string capitalized
         */

        return str.split(" ").map(k => this.capitalize(k)).join(" ");
    }
    createWall(sep) {
        /**
         * Creates a wall. If you add for example:
         * 'Example - Example'
         * 'Test - Hello World'
         * 'This is the longest - Short'
         * 'Tiny - This is even longer then that one!'
         * to the wall and run finishWall, you will get:
         * 'Example             - Example'
         * 'Test                - Hello World'
         * 'This is the longest - Short'
         * 'Tiny                - This is even longer then that one!'
         * ^^ These will be returned from finishWall in an array like this:
         * ['Example             - Example', 'Test                - Hello World', etc...]
         *
         * @param {char} sep The seperator. In the exmaple above it is "-"
         *
         * @returns {str[], function} wall, finishWall -> {str[]}
         */
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
    createLogFile(err = null) {
        /**
         * Create a (crash)log file
         *
         * @param {Error} err If this is not null, create a crash report. If this is null, create a normal log file.
         *
         * @returns {null}
         */
        // Create a (crash-)log file
        if (!fs.existsSync("./logs/")) fs.mkdirSync("./logs/");

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
        let history = game.interact.handleCmds("history", false);

        let name = "Log";
        if (err) name = "Crash Log";

        let errorContent = "";

        if (err) errorContent = `
Error:
${err.stack}
`

        let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.config.version}-${game.config.branch}

Remember to attach the '-ai' log file as well when creating a bug report.

History:
${history}${errorContent}
`

        let filename = "log";
        if (err) filename = "crashlog";

        filename = `${filename}-${dateStringFileFriendly}`;

        fs.writeFileSync(`./logs/${filename}.txt`, content);

        // AI log
        game.config.debug = true; // Do this so it can actually run '/ai'
        let aiHistory = game.interact.handleCmds("/ai", false);

        content = `Hearthstone.js ${name} Log
Date: ${dateString}
Version: ${game.config.version}-${game.config.branch}

Remember to attach the main log file as well when making a bug report. The main log file is the one not ending in '-ai'.

AI History:
${aiHistory}
`

        fs.writeFileSync(`./logs/${filename}-ai.txt`, content);

        if (!err) return;

        console.log(`\nThe game crashed!\nCrash report created in 'logs/${filename}.txt' and 'logs/${filename}-ai.txt'\nPlease create a bug report at:\nhttps://github.com/SolarWindss/Hearthstone.js/issues`.yellow);
        game.input();
    }

    // Getting card info
    getCardByName(name, refer = true) {
        /**
         * Gets the card that has the same name as "name"
         * 
         * @param {string} name The name
         * @param {bool} refer [default=true] If this should call getCardById if it doesn't find the card from the name
         * 
         * @returns {Blueprint} The blueprint of the card
         */

        let card;

        game.cards.forEach(c => {
            if (c.name.toLowerCase() == name.toLowerCase()) card = c;
        });

        if (!card && refer) return this.getCardById(name, false);

        return card;
    }
    getCardById(id, refer = true) {
        /**
         * Gets the card that has the same id as "id"
         * 
         * @param {number} id The id
         * @param {bool} refer [default=true] If this should call getCardByName if it doesn't find the card from the name
         * 
         * @returns {Blueprint} The blueprint of the card
         */

        let card = game.cards.filter(c => c.id == id)[0];

        if (!card && refer) return this.getCardByName(id.toString(), false);

        return card;
    }
    getCards(uncollectible = true, cards = game.cards) {
        /**
         * Returns all cards
         *
         * @param {bool} uncollectible [default=true] Filter out all uncollectible cards
         * @param {Blueprint[]} cards [default=All cards in the game] The cards to get
         *
         * @returns {Blueprint[]} Cards
         */

        let _cards = [];

        cards.forEach(c => {
            if (!c.uncollectible || !uncollectible) _cards.push(c);
        });

        return _cards;
    }
    validateClass(plr, card) {
        /**
         * Returns if the "card"'s class is the same as the "plr"'s or 'Neutral'
         *
         * @param {Player} plr
         * @param {Card} card
         *
         * @returns {bool}
         */
        return [plr.heroClass, "Neutral"].includes(card.class);
    }
    matchTribe(card_tribe, tribe) {
        /**
         * Returns if the "card_tribe" is "tribe" or 'All'
         *
         * @param {str} card_tribe
         * @param {str} tribe
         *
         * @returns {bool}
         */
        if (/all/i.test(card_tribe)) return true; // If the card's tribe is "All".

        return card_tribe.includes(tribe);
    }
    highlander(plr) {
        /* Returns true if the deck has no duplicates.
         *
         * @param {Player} plr The player to check
         *
         * @returns {bool} Highlander
         */

        let deck = plr.deck.map(c => c.name);

        return (new Set(deck)).size == deck.length;
    }
    getClasses() {
        /*
         * Returns all classes in the game
         *
         * @returns {string[]} Classes
         */

        let classes = [];

        fs.readdirSync(game.dirname + "/cards/StartingHeroes").forEach(file => {
            if (!file.endsWith(".js")) return; // Something is wrong with the file name.

            let name = file.slice(0, -3); // Remove ".js"
            name = name.replaceAll("_", " "); // Remove underscores
            name = game.functions.capitalizeAll(name); // Capitalize all words

            let card = game.functions.getCardByName(name + " Starting Hero");

            classes.push(card.class);
        });

        return classes;
    }
    colorByRarity(str, rarity, bold = true) {
        /**
         * Colors "str" based on "rarity". Example: Rarity = "Legendary", return "str".gold
         *
         * @param {string} str The string to color
         * @param {string} rarity The rarity
         * @param {bool} bold [default=true] Automatically apply bold
         *
         * @returns {string} The colored string
         */

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
    parseTags(str) {
        /**
         * Parses color tags in "str". Put the `~` character before the `&` to not parse it. Example: "&BBattlecry:&R Choose a minion. Silence then destroy it."
         *
         * @param {string} str The string to parse
         *
         * @returns {string} The resulting string
         */

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
        let current_types = [];

        // Loop through the characters in str
        str.split("").forEach((c, i) => {
            if (c != "&") {
                if (i > 0 && str[i - 1] == "&") { // Don't add the character if a & precedes it.
                    if (i > 1 && str[i - 2] == "~") {} // But do add the character if the & has been cancelled
                    else return;
                }
                if (c == "~" && i < str.length && str[i + 1] == "&") return; // Don't add the "~" character if it is used to cancel the "&" character
                
                strbuilder += appendTypes(c);
                return;
            }

            // c == "&"
            if (i > 0 && str[i - 1] == "~") { // If there is a `~` before the &, add the & to the string.
                strbuilder += appendTypes(c);
                return;
            }

            let type = str[i + 1];
            current_types.push(type);
        });

        return strbuilder;
    }
    cloneObject(object) {
        /**
         * Clones the "object" and returns the clone
         * 
         * @param {object} object The object to clone
         * 
         * @returns {object} Clone
         */

        return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    }
    cloneCard(card) {
        /**
         * Creates a perfect copy of a card, and sets some essential properties
         * 
         * @param {Card} card The card to clone
         * 
         * @returns {Card} Clone
         */

        let clone = this.cloneObject(card);

        clone.randomizeIds();
        clone.sleepy = true;
        clone.turn = game.turns;

        return clone;
    }
    doPlayerTargets(plr, callback) {
        /**
         * Calls "callback" on all "plr"'s targets 
         *
         * @param {Player} plr The player
         * @param {function} callback The callback to call (args: {Card | Player})
         */

        game.board[plr.id].forEach(m => {
            callback(m);
        });

        callback(plr);
    }
    addEventListener(key, checkCallback, callback, lifespan = 1) {
        /**
         * Add an event listener.
         *
         * @param {str} key The event to listen for. If this is an empty string, it will listen for any event.
         * @param {function | bool} checkCallback This will trigger when the event gets broadcast, but before the actual code in `callback`. If this returns false, the event listener will ignore the event. If you set this to `true`, it is the same as doing `() => {return true}`. This function gets the paramater: {any} val The value of the event
         * @param {function} callback The code that will be ran if the event listener gets triggered and gets through `checkCallback`. If this returns true, the event listener will be destroyed.
         * @param {number} lifespan How many times the event listener will trigger and call "callback" before self-destructing. Set this to -1 to make it last forever, or until it is manually destroyed using "callback".
         *
         * @returns {function} If you call this function, it will destroy the event listener.
         */
        let times = 0;

        let id = game.events.eventListeners;

        const remove = () => {
            delete game.eventListeners[id];
        }

        game.eventListeners[id] = (_, _key, _val) => {
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
    spellDmg(target, damage) {
        /**
         * Deals damage to "target" based on your spell damage
         * 
         * @param {Card | Player} target The target
         * @param {number} damage The damage to deal
         * 
         * @returns {number} The target's new health
         */

        const dmg = this.accountForSpellDmg(damage);

        game.events.broadcast("SpellDealsDamage", [target, dmg], game.player);
        game.attack(dmg, target);

        return target.getHealth();
    }

    // Account for certain stats
    accountForSpellDmg(damage) {
        /**
         * Returns "damage" + The player's spell damage
         * 
         * @param {number} damage
         * 
         * @returns {number} Damage + spell damage
         */

        return damage + game.player.spellDamage;
    }
    accountForUncollectible(cards) {
        /**
         * Filters out all cards that are uncollectible in a list
         * 
         * @param {Card[] | Blueprint[]} cards The list of cards
         * 
         * @returns {Card[] | Blueprint[]} The cards without the uncollectible cards
         */

        return cards.filter(c => !c.uncollectible);
    }

    // Keyword stuff
    dredge(prompt = "Choose One:") {
        /**
         * Asks the user a "prompt" and show 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
         * 
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {Card} The card chosen
         */

        // Look at the bottom three cards of the deck and put one on the top.
        let cards = game.player.deck.slice(0, 3);

        // Check if ai
        if (game.player.ai) {
            let card = game.player.ai.dredge(cards);

            game.player.deck = game.player.deck.filter(c => c != card); // Removes the selected card from the players deck.
            game.player.deck.push(card);

            return card;
        }

        game.interact.printAll(game.player);

        let p = `\n${prompt}\n[`;

        if (cards.length <= 0) return;

        cards.forEach((c, i) => {
            p += `${i + 1}: ${c.displayName}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        let choice = game.input(p);

        let card = parseInt(choice) - 1;
        card = cards[card];

        if (!card) {
            return this.dredge(prompt);
        }

        game.player.deck = game.player.deck.filter(c => c != card); // Removes the selected card from the players deck.
        game.player.deck.push(card);

        return card;
    }
    adapt(minion, prompt = "Choose One:", _values = []) {
        /**
         * Asks the user a "prompt" and show 3 choices for the player to choose, and do something to the minion based on the choice
         * 
         * @param {Card} minion The minion to adapt
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {string} The name of the adapt chosen. See the first values of possible_cards
         */

        game.interact.printAll(game.player);

        let possible_cards = [
            ["Crackling Shield", "Divine Shield"],
            ["Flaming Claws", "+3 Attack"],
            ["Living Spores", "Deathrattle: Summon two 1/1 Plants."],
            ["Lightning Speed", "Windfury"],
            ["Liquid Membrane", "Can't be targeted by spells or Hero Powers."],
            ["Massive", "Taunt"],
            ["Volcanic Might", "+1/+1"],
            ["Rocky Carapace", "+3 Health"],
            ["Shrouding Mist", "Stealth until your next turn."],
            ["Poison Spit", "Poisonous"]
        ];
        let values = _values;

        if (values.length == 0) {
            for (let i = 0; i < 3; i++) {
                let c = game.functions.randList(possible_cards);

                values.push(c);
                this.remove(possible_cards, c);
            }
        }

        let p = `\n${prompt}\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        let choice = game.input(p);
        if (!parseInt(choice)) {
            game.input("Invalid choice!\n".red);
            return this.adapt(minion, prompt, values);
        }

        if (parseInt(choice) > 3) return this.adapt(minion, prompt, values);

        choice = values[parseInt(choice) - 1][0];

        switch (choice) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.summonMinion(new game.Card("Plant"), plr);
                    game.summonMinion(new game.Card("Plant"), plr);
                });

                break;
            case "Lightning Speed":
                minion.addKeyword("Windfury");

                break;
            case "Liquid Membrane":
                minion.addKeyword("Elusive");

                break;
            case "Massive":
                minion.addKeyword("Taunt");

                break;
            case "Volcanic Might":
                minion.addStats(1, 1);

                break;
            case "Rocky Carapace":
                minion.addStats(0, 3);

                break;
            case "Shrouding Mist":
                minion.addKeyword("Stealth");
                minion.setStealthDuration(1);

                break;
            case "Poison Spit":
                minion.addKeyword("Poisonous");

                break;
            default:
                break;
        }

        return choice;
    }
    invoke(plr) {
        /**
         * Call invoke on the player
         * 
         * @param {Player} plr The player
         * 
         * @returns {undefined}
         */

        // Filter all cards in "plr"'s deck with a name that starts with "Galakrond, the "
        
        // --- REMOVE FOR DEBUGGING ---
        let cards = plr.deck.filter(c => c.displayName.startsWith("Galakrond, the "));
        if (cards.length <= 0) return;
        // ----------------------------

        switch (plr.heroClass) {
            case "Priest":
                // Add a random Priest minion to your hand.
                let possible_cards = cards.filter(c => c.type == "Minion" && c.class == "Priest");
                if (possible_cards.length <= 0) return;

                let card = game.functions.randList(possible_cards);
                plr.addToHand(card);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                plr.addToHand(new game.Card(game.functions.randList(lackey_cards)), plr);

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                game.summonMinion(new game.Card("Windswept Elemental", plr), plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.                
                plr.addAttack(3);

                break;
            default:
                break;
        }
    }
    recruit(plr, list = null, amount = 1) {
        /**
         * Put's a minion within "mana_range" from the plr's deck, into the board
         * 
         * @param {Player} plr [default=current player] The player
         * @param {Card[]} list [default=current player's deck] The list to recruit from
         * @param {number} amount [default=1] The amount of minions to recruit
         * 
         * @returns {Card[]} Returns the cards recruited
         */

        if (list == null) list = plr.deck;
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
            this.remove(plr.deck, c);
        });

        return cards;
    }

    createJade(plr) {
        /**
         * Creates and returns a jade golem with the correct stats and cost for the player
         * 
         * @param {Player} plr The jade golem's owner
         * 
         * @returns {Card} The jade golem
         */

        if (plr.jadeCounter < 30) plr.jadeCounter += 1;
        const count = plr.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new game.Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }
    importConfig(path) {
        /**
         * Imports the config from the "path" specified.
         *
         * @param {str} path The path to import from.
         *
         * @returns {null}
         */
        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let c = `${path}/${file.name}`;

            if (file.name.endsWith(".json")) {
                let f = require(c);

                game.config = Object.assign({}, game.config, f);
            }
            else if (file.isDirectory()) this.importConfig(c);
        });

        game.doConfigAI();
    }
    _importCards(path) {
        /**
         * Imports all cards from a folder and returns the cards.
         * Don't use.
         * 
         * @param {string} path The path
         * 
         * @returns {undefined}
         */

        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let p = `${path}/${file.name}`;

            if (file.name.endsWith(".js")) {
                let f = require(p);
                
                game.cards.push(f);
            }
            else if (file.isDirectory()) this._importCards(p);
        });
    }
    importCards(path) {
        /**
         * Imports all cards from a folder
         * 
         * @param {string} path The path
         * 
         * @returns {undefined}
         */

        game.cards = [];

        this._importCards(path);

        setup_card(game, game.cards);
        setup_ai(game);
        setup_player(game);
    }
    mulligan(plr, input) {
        /**
         * Mulligans the cards from input. Read interact.mulligan for more info
         *
         * @param {Player} plr The player who mulligans
         * @param {String} input The ids of the cards to mulligan
         *
         * @returns {Card[]} The cards mulligan'd
         */

        if (!parseInt(input)) return false;

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
    progressQuest(name, value = 1) {
        /**
         * Progress a quest by a value
         * 
         * @param {string} name The name of the quest
         * @param {number} value [default=1] The amount to progress the quest by
         * 
         * @returns {number} The new progress
         */

        let quest = game.player.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.player.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.player.quests.find(s => s["name"] == name);

        quest["progress"][0] += value;

        return quest["progress"][0];
    }
    addQuest(type, plr, card, key, val, callback, next = null) {
        /**
         * Adds a quest / secrets to a player
         * 
         * @param {string} type The type of the quest: ["Quest", "Sidequest", "Secret"]
         * @param {Player} plr The player to add the quest to
         * @param {Card} card The quest / secret
         * @param {string} key The key of the quest
         * @param {any} val The value that the quest needs
         * @param {Function} callback The function to call when the key is invoked, arguments: {any[]} val The value, {turn} The turn the quest was played, {boolean} done If the the quest is done
         * @param {string} next [default=null] The name of the next quest / sidequest / secret that should be added when the quest is done
         * 
         * @returns {undefined}
         */

        const t = plr[type.toLowerCase() + "s"];

        if ( (type.toLowerCase() == "quest" && t.length > 0) || ((type.toLowerCase() == "secret" || type.toLowerCase() == "sidequest") && (t.length >= 3 || t.filter(s => s.displayName == card.displayName).length > 0)) ) {
            plr.addToHand(card);
            //plr.mana += card.mana;
            
            return false;
        }

        plr[type.toLowerCase() + "s"].push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "next": next});
    }
}

exports.Functions = Functions;

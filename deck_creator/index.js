'use strict';

const colors = require("colors");

try {
    require(__dirname + "/../src/game");
} catch (err) {
    require("readline-sync").question("ERROR: This program is dependant on the modules in Hearthstone.js, so the file 'index.js' needs to be in the directory 'Hearthstone.js/deck_creator'.\n".red);
    require("process").exit(1);
}

const { Game } = require("../src/game");

const game = new Game({}, {});
const functions = game.functions;
game.dirname = __dirname + "/../";

functions.importCards(__dirname + "/../cards");
functions.importConfig(__dirname + "/config");
// ===========================================================

const config = game.config;
const cards = functions.getCards();
const classes = functions.getClasses();

let chosen_class;
let filtered_cards = {};

let deck = [];
let runes = "";

let plr = new game.Player("");

let maxDeckLength = config.maxDeckLength;
let minDeckLength = config.minDeckLength;

let cardId = "id";
let cardPage = 1;
let cardsPerPage = 15;
let cardSortType = "rarity";
let cardSortOrder = "asc";
let maxPage = cardPage;
let searchQuery = "";
let viewClass;

function askClass() {
    game.interact.printName();
    let _class = game.input("What class to you want to choose?\n" + classes.join(", ") + "\n");
    if (_class) _class = functions.capitalizeAll(_class);

    if (!classes.includes(_class)) return askClass();

    if (_class == "Death Knight") {
        runes = "";

        while (runes.length < 3) {
            game.interact.printName();

            let rune = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!rune || !["B", "F", "U"].includes(rune[0].toUpperCase())) continue;

            runes += rune[0].toUpperCase();
        }

        plr.runes = runes;
    }

    return _class;
}

function getDisplayName(card) {
    return card.displayName || card.name;
}

function sortCards(_cards) {
    if (!["asc", "desc"].includes(cardSortOrder)) cardSortOrder = "asc"; // If the order is invalid, fall back to ascending
    cardSortType = cardSortType.toLowerCase();
    cardSortOrder = cardSortOrder.toLowerCase();

    let type = cardSortType;
    let order = cardSortOrder;

    const calcOrder = (a, b) => {
        if (order == "asc") return a - b;
        else return b - a;
    }

    if (type == "rarity") {
        let sortScores = ["Free", "Common", "Rare", "Epic", "Legendary"];

        return _cards.sort((a, b) => {
            let scoreA = sortScores.indexOf(a.rarity);
            let scoreB = sortScores.indexOf(b.rarity);

            return calcOrder(scoreA, scoreB);
        });
    }

    if (["name", "type"].includes(type)) {
        return _cards.sort((a, b) => {
            let typeA;
            let typeB;

            if (type == "name") {
                typeA = getDisplayName(a);
                typeB = getDisplayName(b);
            }
            else {
                typeA = functions.getType(a);
                typeB = functions.getType(b);
            }

            let ret = typeA.localeCompare(typeB);
            if (order == "desc") ret = -ret;

            return ret;
        });
    }

    if (["cost", "id"].includes(type)) {
        return _cards.sort((a, b) => {
            return calcOrder(a[type], b[type]);
        });
    }

    // If 'type' isn't valid, fall back to sorting by rarity
    cardSortType = "rarity";
    return sortCards(_cards);
}

function searchCards(_cards) {
    if (searchQuery == "") return _cards;

    let ret_cards = [];

    let query = searchQuery.split(":");

    if (query.length <= 1) {
        // The user didn't specify a key. Do a general search
        query = query[0].toLowerCase();

        _cards.forEach(c => {
            let name = getDisplayName(c).toLowerCase();
            let desc = c.desc.toLowerCase();

            if (!name.includes(query) && !desc.includes(query)) return;

            ret_cards.push(c);
        });

        return ret_cards;
    }

    let [key, val] = query;

    val = val.toLowerCase();

    const doReturn = (c) => {
        let ret = c[key];

        if (!ret) {
            console.log(`\nKey '${key}' not valid!`.red);
            return -1;
        }

        if (typeof(ret) === "string") return ret.toLowerCase().includes(val);
        else if (typeof(ret) === "number") return ret == val;
    }

    let error = false;

    _cards.forEach(c => {
        if (error) return;

        let ret = doReturn(c);

        if (ret === -1) {
            error = true;
            return;
        }

        if (ret) ret_cards.push(c);
    });

    if (error) return false;

    return ret_cards;
}

function showCards() {
    filtered_cards = {};
    game.interact.printName();
    showConfig();

    if (!viewClass) viewClass = chosen_class;

    Object.values(cards).forEach(c => {
        if (c.runes && !plr.testRunes(c.runes)) return;

        let reg = new RegExp(`^${chosen_class}|Neutral`);

        c.class.split(" / ").forEach(cl => {
            if (!reg.test(cl)) return;

            filtered_cards[c.name] = c;
        });
    });

    let cpp = cardsPerPage;
    let page = cardPage;

    // Search

    if (searchQuery != "") console.log(`\nSearching for '${searchQuery}'.`);
    let _filtered_cards = Object.values(filtered_cards).filter(c => c.class == viewClass);
    _filtered_cards = searchCards(_filtered_cards);
    if (_filtered_cards === false) {
        game.input(`Search failed! Removing search query.\n`.red);
        searchQuery = ""
        return showCards();
    }

    maxPage = Math.ceil(_filtered_cards.length / cpp);
    if (page > maxPage) page = maxPage;

    console.log();

    let oldSortType = cardSortType;
    let oldSortOrder = cardSortOrder;
    console.log(`Sorting by ${cardSortType.toUpperCase()}, ${cardSortOrder}ending.`);

    // Sort
    _filtered_cards = sortCards(_filtered_cards);

    let sortTypeInvalid = oldSortType != cardSortType;
    let sortOrderInvalid = oldSortOrder != cardSortOrder;

    if (sortTypeInvalid) console.log(`Sorting by '${oldSortType.toUpperCase()}' failed! Falling back to ${cardSortType.toUpperCase()}.`.yellow);
    if (sortOrderInvalid) console.log(`Ordering by '${oldSortOrder}ending' failed! Falling back to ${cardSortOrder}ending.`.yellow)

    if (sortTypeInvalid || sortOrderInvalid) console.log(`\nSorting by ${cardSortType.toUpperCase()}, ${cardSortOrder}ending.`);

    // Page logic
    _filtered_cards = _filtered_cards.slice(cpp * (page - 1), cpp * page);

    // Loop
    console.log(`\nPage ${page} / ${maxPage}\n`);

    console.log(viewClass.rainbow);

    let [wall, finishWall] = functions.createWall("-");

    _filtered_cards.forEach(c => {
        wall.push(getDisplayName(c) + " - " + c.id);
    });

    finishWall().forEach(b => {
        b = b.split("-");

        b = functions.colorByRarity(b[0], findCard(b[0].trim()).rarity) + "-" + b[1];

        console.log(b);
    });
}

function showConfig() {
    let config_text = "### RULES ###";
    console.log("#".repeat(config_text.length));
    console.log(config_text);
    console.log("#".repeat(config_text.length));

    console.log("#");

    console.log("# Validation: " + (config.validateDecks ? "ON".green : "OFF".red));

    console.log("#\n# Rule 1. Minimum Deck Length: " + minDeckLength.toString().yellow);
    console.log("# Rule 2. Maximum Deck Length: " + maxDeckLength.toString().yellow);

    console.log("#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: " + "x".yellow + " Seances in a deck): " + config.maxOfOneCard.toString().yellow);
    console.log("# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): " + config.maxOfOneLegendary.toString().yellow);

    console.log("#");

    console.log("# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid");
    console.log("# Valid decks will work properly");
    console.log("# Pseudo-valid decks will be rejected by the deck importer for violating a rule");
    console.log("# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.");
    console.log("# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.");

    console.log("#");

    console.log("#".repeat(config_text.length));
}

function findCard(card) {
    let _card;

    Object.values(filtered_cards).forEach(c => {
        if (getDisplayName(c).toLowerCase() == card.toLowerCase() || c.id == card) _card = c;
    });

    return _card;
}

function chooseCard(prompt) {
    let card = game.input(prompt);
    card = findCard(card);

    if (!card) return chooseCard();

    return card;
}

function viewCard(c) {
    let stats = "";

    if (["Minion", "Weapon"].includes(functions.getType(c))) stats = ` [${c.stats.join(' / ')}]`.green;
    console.log(`{${c.mana}} `.cyan + functions.colorByRarity(getDisplayName(c), c.rarity) + stats + ` (${c.desc}) ` + `(${functions.getType(c)})`.yellow);

    game.input("\nPress enter to continue...");
}

function add(c) {
    deck.push(c);

    if (!c.settings) return;

    maxDeckLength = c.settings.maxDeckSize || maxDeckLength
    minDeckLength = c.settings.minDeckSize || minDeckLength
}
function remove(c) {
    deck.splice(deck.indexOf(c), 1);
}

function viewDeck() {
    game.interact.printName();

    console.log("Deck Size: " + deck.length.toString().yellow + "\n");

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    Object.values(_cards).forEach(c => {
        let card = c[0];
        let amount = c[1];

        if (amount == 1) {
            console.log(functions.colorByRarity(getDisplayName(card), card.rarity));
            return;
        }

        console.log(`x${amount} ` + functions.colorByRarity(getDisplayName(card), card.rarity));
    });
    
    game.input("\nPress enter to continue...");
}

function deckcode() {
    let pseudo = false;

    // Deck size warnings
    if (deck.length < minDeckLength) {
        console.log("WARNING: Rule 1 violated.".yellow);

        pseudo = true;
    }
    if (deck.length > maxDeckLength) {
        console.log("WARNING: Rule 2 violated.".yellow);

        pseudo = true;
    }

    // Check if the deck is empty
    if (deck.length <= 0) {
        console.log("ERROR: Could not generate deckcode as your deck is empty. The resulting deckcode would be invalid.".red);
        return ["", "invalid"];
    }

    let deckcode = `# ${chosen_class} # `;
    if (runes) deckcode += `[${runes}] `;

    deckcode += "/";

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    let __cards = {};

    Object.values(_cards).forEach(c => {
        let a = c[1];
        if (!__cards[a]) __cards[a] = [];
        __cards[a].push(c);
    });

    let str_cards = "";

    let prev_amount = 0;
    Object.values(__cards).forEach((c, i) => {
        let amount = c[0][1];

        if (i == Object.keys(__cards).length - 1) deckcode += `${amount},`;
        else deckcode += `${amount}:${__cards[amount].length},`; // "/3:5,2:8,1/";

        c.forEach(v => {
            let card = v[0];

            str_cards += `${card[cardId]},`;

            if (amount > config.maxOfOneLegendary && card.rarity == "Legendary") {
                console.log("WARNING: Rule 4 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);

                pseudo = true;
            }
            else if (amount > config.maxOfOneCard) {
                console.log("WARNING: Rule 3 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);

                pseudo = true;
            }
        });
    });

    deckcode = deckcode.slice(0, -1); // Remove the last ", "

    deckcode += "/ ";
    deckcode += str_cards;
    deckcode = deckcode.slice(0, -1); // Remove the last ", "

    return pseudo ? [deckcode, "pseudo"] : [deckcode, "valid"];
}

function help() {
    game.interact.printName();

    // Commands
    console.log("Available commands:".bold);
    console.log("(In order to run a command; input the name of the command and follow further instruction.)\n");
    console.log("(name) [optional] (required) - (description)\n");

    console.log("add [name | id]       - Add a card to the deck");
    console.log("remove [card | id]    - Remove a card from the deck");
    console.log("view [card | id]      - View a card");
    console.log("page (num)            - View a different page");
    console.log("cards (class)         - Show cards from 'class'");
    console.log("sort (type) [order]   - Sorts by 'type' in 'order'ending order. (Type can be: ('rarity', 'name', 'cost', 'id', 'type'), Order can be: ('asc', 'desc')) (Example: sort cost asc - Will show cards ordered by cost, ascending.)");
    console.log("search [query]        - Searches by query. Keys: ('name', 'desc', 'mana', 'rarity', 'id'), Examples: (search the - Search for all cards with the word 'the' in the name or description, case insensitive.), (search mana:2 - Search for all cards that costs 2 mana)");
    console.log("deck                  - View the deck");
    console.log("deckcode              - View the current deckcode");
    console.log("import                - Imports a deckcode (Overrides your deck)");
    console.log("export                - Temporarily saves your deck to the runner so that when you choose to play, the decks get filled in automatically. (Only works when running the deck creator from the Hearthstone.js Runner)");
    console.log("set (setting) (value) - Change some settings. Look down to 'Set Subcommands' to see available settings");
    console.log("class                 - Change the class");
    console.log("help                  - Displays this message");
    console.log("exit                  - Quits the program");

    // Set
    console.log("\nSet Subcommands:".bold);
    console.log("(In order to use these; input 'set ', then one of the subcommands. Example: 'set cpp 20')\n");
    console.log("(name) [optional] (required) - (description)\n");

    console.log("name                     - Makes the deckcode generator use names instead of ids");
    console.log("id                       - Makes the deckcode generator use ids instead of names");
    console.log("cardsPerPage | cpp (num) - How many cards to show per page [default = 15]");

    console.log("\nNote the 'cardsPerPage' commands has 2 different subcommands; cpp & cardsPerPage. Both do the same thing.".gray);

    // Notes
    console.log("\nNotes:".bold);

    console.log("Type 'cards Neutral' to see Neutral cards.");

    game.input("\nPress enter to continue...\n");
}

function getCardArg(cmd, callback) {
    let times = 1;

    let card = cmd.split(" ");
    card.shift();

    if (card.length > 1 && parseInt(card[0])) {
        times = parseInt(card[0])
        card.shift();
    }

    card = card.join(" ");

    card = findCard(card);

    if (!card) {
        game.input("Invalid card.\n".red);
        return false;
    }

    for (let i = 0; i < times; i++) callback(card);

    return card;
}

function handleCmds(cmd) {
    if (cmd == "view") {
        let card = chooseCard("View a card: ");

        viewCard(card);
    }
    else if (cmd.startsWith("view")) {
        getCardArg(cmd, viewCard);
    }
    else if (cmd == "add") {
        let card = chooseCard("Add a card to the deck: ");

        add(card);
    }
    else if (cmd.startsWith("a")) {
        getCardArg(cmd, add);
    }
    else if (cmd == "remove") {
        let card = chooseCard("Remove a card from the deck: ");

        remove(card);
    }
    else if (cmd.startsWith("r")) {
        getCardArg(cmd, remove);
    }
    else if (cmd.startsWith("p")) {
        let page = cmd.split(" ");
        page.shift();
        page = page.join(" ");

        page = parseInt(page)
        if (!page) return;

        if (page < 1) page = 1;
        cardPage = parseInt(page);
    }
    else if (cmd.startsWith("cards")) {
        let _class = cmd.split(" ");
        _class.shift();

        if (_class.length <= 0) return;

        _class = _class.join(" ");
        _class = functions.capitalizeAll(_class);

        if (!classes.includes(_class) && _class != "Neutral") {
            game.input("Invalid class!\n".red);
            return;
        }

        if (![chosen_class, "Neutral"].includes(_class)) {
            game.input(`Class '${_class}' is a different class. To see these cards, please switch class from '${chosen_class}' to '${_class}' to avoid confusion.\n`.red);
            return;
        }

        viewClass = _class;
    }
    else if (cmd.startsWith("deckcode")) {
        let [_deckcode, error] = deckcode();

        let toPrint = _deckcode + "\n";
        if (error == "invalid") toPrint = "";

        game.input(toPrint);
    }
    else if (cmd.startsWith("sort")) {
        let args = cmd.split(" ");
        args.shift();

        if (args.length <= 0) return;

        cardSortType = args[0];
        cardSortOrder = args[1] || cardSortOrder;
    }
    else if (cmd.startsWith("search")) {
        let args = cmd.split(" ");
        args.shift();

        if (args.length <= 0) {
            searchQuery = "";
            return;
        }

        args = args.join(" ");

        searchQuery = args;
    }
    else if (cmd.startsWith("deck")) {
        viewDeck();
    }
    else if (cmd.startsWith("import")) {
        let _deckcode = game.input("Please input a deckcode: ");

        game.config.validateDecks = false;
        let _deck = functions.importDeck(plr, _deckcode);
        game.config.validateDecks = true;

        if (_deck == "invalid") return;

        deck = [];
        _deck.forEach(c => add(c)); // You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.

        chosen_class = plr.heroClass;
    }
    else if (cmd.startsWith("export")) {
        if (!opened_from_runner) {
            game.input("ERROR: This command can only be used when the deck creator was opened using the Hearthstone.js Runner.\n".red);
            return;
        }

        let [_deckcode, error] = deckcode();

        if (error != "valid") {
            game.input("ERROR: Cannot export invalid / pseudo-valid deckcodes.\n".red);
            return;
        }

        require(__dirname + "/../index").store_deck(_deckcode);

        game.input("Deck successfully exported.\n".green);
    }
    else if (cmd.startsWith("class")) {
        let _runes = runes;
        let new_class = askClass();

        if (new_class == chosen_class && runes == _runes) {
            game.input("Your class was not changed\n".yellow);
            return;
        }

        deck = [];
        chosen_class = new_class;
        if (viewClass != "Neutral") viewClass = chosen_class;
    }
    else if (cmd.startsWith("set")) {
        let setting = cmd.split(" ");
        setting.shift();
        let args = setting.slice(1);
        setting = setting[0];

        switch (setting) {
            case "id":
                cardId = "id";
                break;
            case "name":
                cardId = "name";
                break;
            case "cpp":
            case "cardsPerPage":
                cardsPerPage = parseInt(args);
                break;
            default:
                game.input(`'${setting}' is not a valid setting.\n`.red);
                return;
        }

        game.input("Setting successfully changed!\n".green);
    }
    else if (cmd.startsWith("help")) {
        help();
    }
    else if (cmd.startsWith("exit")) {
        running = false;
    }
}

let opened_from_runner = false;
let running = true;

function runner() {
    require(__dirname + "/../index").free_decks(); // Remove all decks
    opened_from_runner = true;
    running = true;
    main();
}

function main() {
    chosen_class = askClass();

    while (running) {
        showCards();
        handleCmds(game.input("\n> "));
    }
}

exports.runner = runner;

if (require.main == module) main();

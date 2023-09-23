/**
 * This is the deck creator.
 * @module Deck Creator
 */
import util from "util";

import { createGame } from "../src/internal.js";
import { Blueprint, CardClass, CardClassNoNeutral, GameConfig } from "../src/types.js";

const { game, player1: plr, player2 } = createGame();

const config = game.config;
const classes = game.functions.getClasses();
let cards = game.functions.getCards();

let chosen_class: CardClassNoNeutral;
let filtered_cards: Blueprint[] = [];

let deck: Blueprint[] = [];
let runes = "";

let warnings: {[key: string]: boolean} = {
    latestCard: true
}

type Settings = {
    card: {
        history: Blueprint[]
    },
    view: {
        type: "cards" | "deck",
        page: number,
        maxPage?: number,
        cpp: number,
        class?: CardClass 
    },
    sort: {
        type: keyof Blueprint,
        order: "asc" | "desc"
    },
    search: {
        query: string[],
        prevQuery: string[]
    },
    deckcode: {
        cardId: "id" | "name",
        format: "js" | "vanilla"
    },
    commands: {
        default: string,
        history: string[],
        undoableHistory: string[]
    },
    other: {
        firstScreen: boolean
    }
}

let settings: Settings = {
    card: {
        history: []
    },
    view: {
        type: "cards",
        page: 1,
        // Cards per page
        cpp: 15
    },
    sort: {
        type: "rarity",
        order: "asc"
    },
    search: {
        query: [],
        prevQuery: []
    },
    deckcode: {
        cardId: "id",
        format: "js"
    },
    commands: {
        default: "add",
        history: [],
        undoableHistory: []
    },
    other: {
        firstScreen: true
    }
}

function printName() {
    game.interact.cls();
    game.log("Hearthstone.js Deck Creator (C) 2022\n");
}

function askClass(): CardClassNoNeutral {
    printName();

    let heroClass = game.input("What class do you want to choose?\n" + classes.join(", ") + "\n");
    if (heroClass) heroClass = game.functions.capitalizeAll(heroClass);

    if (!classes.includes(heroClass as CardClassNoNeutral)) return askClass();

    if (heroClass === "Death Knight") {
        runes = "";

        while (runes.length < 3) {
            printName();

            let rune = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!rune || !["B", "F", "U"].includes(rune[0].toUpperCase())) continue;

            runes += rune[0].toUpperCase();
        }

        plr.runes = runes;
    }

    return heroClass as CardClassNoNeutral;
}

function sortCards(_cards: Blueprint[]) {
    // If the order is invalid, fall back to ascending
    if (!["asc", "desc"].includes(settings.sort.order)) settings.sort.order = "asc";

    let type = settings.sort.type;
    let order = settings.sort.order;

    const calcOrder = (a: number, b: number) => {
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
                typeA = game.interact.getDisplayName(a);
                typeB = game.interact.getDisplayName(b);
            }
            else {
                typeA = a.type;
                typeB = b.type;
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
    settings.sort.type = "rarity";
    return sortCards(_cards);
}

function searchCards(_cards: Blueprint[], sQuery: string) {
    if (sQuery.length <= 0) return _cards;

    let ret_cards: Blueprint[] = [];

    let splitQuery = sQuery.split(":");

    if (splitQuery.length <= 1) {
        // The user didn't specify a key. Do a general search
        let query = splitQuery[0].toLowerCase();

        _cards.forEach(c => {
            let name = game.interact.getDisplayName(c).toLowerCase();
            let desc = c.desc.toLowerCase();

            if (!name.includes(query) && !desc.includes(query)) return;

            ret_cards.push(c);
        });

        return ret_cards;
    }

    let [key, val] = splitQuery;

    val = val.toLowerCase();

    const doReturn = (c: Blueprint) => {
        let ret = c[key as keyof Blueprint];

        // Javascript
        if (!ret && ret !== 0) {
            game.log(`<red>\nKey '${key}' not valid!</red>`);
            return -1;
        }

        // Mana even / odd
        if (key == "cost") {
            // Mana range (1-10)
            let regex = /\d+-\d+/;
            if (regex.test(val)) {
                let _val = val.split("-");

                let min = _val[0];
                let max = _val[1];

                return ret >= min && ret <= max;
            }

            if (val == "even") return ret % 2 == 0;
            else if (val == "odd") return ret % 2 == 1;
            else if (!Number.isNaN(parseInt(val))) return ret == val;
            else {
                game.log(`<red>\nValue '${val}' not valid!</red>`);
                return -1;
            }
        }

        if (typeof(ret) === "string") return ret.toLowerCase().includes(val);
        else if (typeof(ret) === "number") return ret == parseFloat(val);
        return -1;
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

function noCards() {
    // If there are no cards, ask the user if they want to search for uncollectible cards
    if (cards.length > 0) return;

    printName();
    game.log("<yellow>No cards found. This means that the game doesn't have any (collectible) cards.</yellow>");

    // Only ask once
    if (!settings.other.firstScreen) return;

    let uncollectible = game.interact.yesNoQuestion(plr, "Would you like the program to search for uncollectible cards? Decks with uncollectible cards aren't valid. (You will only be asked once)");
    settings.other.firstScreen = false;

    if (!uncollectible) return;

    cards = game.functions.getCards(false);
}

function showCards() {
    // If there are no cards, ask the user if they want to search for uncollectible cards
    if (cards.length <= 0) noCards();

    filtered_cards = [];
    printName();

    // If the user chose to view an invalid class, reset the viewed class to default.
    let correctClass = game.functions.validateClasses([chosen_class], settings.view.class ?? chosen_class);
    if (!settings.view.class || !correctClass) settings.view.class = chosen_class;

    // Filter away cards that aren't in the chosen class
    Object.values(cards).forEach(c => {
        if (c.runes && !plr.testRunes(c.runes)) return;

        let correctClass = game.functions.validateClasses(c.classes, settings.view.class ?? chosen_class);
        if (correctClass) filtered_cards.push(c);
    });

    if (filtered_cards.length <= 0) {
        game.log(`<yellow>No cards found for the selected classes '${chosen_class} and Neutral'.</yellow>`);
    }

    let cpp = settings.view.cpp;
    let page = settings.view.page;

    // Search

    if (settings.search.query.length > 0) game.log(`Searching for '${settings.search.query.join(' ')}'.`);

    // Filter to show only cards in the viewed class
    let classCards = Object.values(filtered_cards).filter(c => c.classes.includes(settings.view.class ?? chosen_class));

    if (classCards.length <= 0) {
        game.log(`<yellow>No cards found for the viewed class '${settings.view.class}'.</yellow>`);
        return;
    }

    let searchFailed = false;

    // Search functionality
    settings.search.query.forEach(q => {
        if (searchFailed) return;

        let searchedCards = searchCards(classCards, q);

        if (searchedCards === false) {
            game.input(`<red>Search failed at '${q}'! Reverting back to last successful query.\n</red>`);
            searchFailed = true;
            return;
        }

        classCards = searchedCards;
    });

    if (classCards.length <= 0) {
        game.input(`<yellow>\nNo cards match search.\n</yellow>`);
        searchFailed = true;
    }

    if (searchFailed) {
        settings.search.query = settings.search.prevQuery;
        return showCards();
    }

    settings.search.prevQuery = settings.search.query;

    settings.view.maxPage = Math.ceil(classCards.length / cpp);
    if (page > settings.view.maxPage) page = settings.view.maxPage;

    let oldSortType = settings.sort.type;
    let oldSortOrder = settings.sort.order;
    game.log(`Sorting by ${settings.sort.type.toUpperCase()}, ${settings.sort.order}ending.`);

    // Sort
    classCards = sortCards(classCards);

    let sortTypeInvalid = oldSortType != settings.sort.type;
    let sortOrderInvalid = oldSortOrder != settings.sort.order;

    if (sortTypeInvalid) {
        game.log(`<yellow>Sorting by </yellow>'%s'<yellow> failed! Falling back to </yellow>%s.`, oldSortType.toUpperCase(), settings.sort.type.toUpperCase());
    }
    if (sortOrderInvalid) {
        game.log(`<yellow>Ordering by </yellow>'%sending'<yellow> failed! Falling back to </yellow>%sending.`, oldSortOrder, settings.sort.order);
    }

    if (sortTypeInvalid || sortOrderInvalid) game.log(`\nSorting by ${settings.sort.type.toUpperCase()}, ${settings.sort.order}ending.`);

    // Page logic
    classCards = classCards.slice(cpp * (page - 1), cpp * page);

    // Loop
    game.log(`\nPage ${page} / ${settings.view.maxPage}\n`);

    game.log(`<underline>${settings.view.class}</underline>`);

    let bricks: string[] = [];
    classCards.forEach(c => {
        bricks.push(game.interact.getDisplayName(c) + " - " + c.id);
    });

    let wall = game.functions.createWall(bricks, "-");

    wall.forEach(brick => {
        let brickSplit = brick.split("-");

        let card = findCard(brickSplit[0].trim());
        if (!card) return;

        let toDisplay = game.functions.colorByRarity(brickSplit[0], card.rarity) + "-" + brickSplit[1];

        game.log(toDisplay);
    });

    game.log("\nCurrent deckcode output:");
    let _deckcode = deckcode();

    if (!_deckcode.error) {
        game.log("<bright:green>Valid deck!</>");
        game.log(_deckcode.code);
    }

    if (settings.other.firstScreen) {
        game.log("\nType 'rules' to see a list of rules.");

        settings.other.firstScreen = false;
    }
}

function showRules() {
    let config_text = "### RULES ###";
    game.log("#".repeat(config_text.length));
    game.log(config_text);
    game.log("#".repeat(config_text.length));

    game.log("#");

    game.log("# Validation: %s", (config.decks.validate ? "<bright:green>ON</>" : "<red>OFF</red>"));

    game.log(`#\n# Rule 1. Minimum Deck Length: <yellow>${config.decks.minLength}</yellow>`);
    game.log(`# Rule 2. Maximum Deck Length: %s <yellow>${config.decks.maxLength}</yellow>`);

    game.log(`#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: <yellow>x</yellow> Seances in a deck): <yellow>${config.decks.maxOfOneCard}</yellow>`);
    game.log(`# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): <yellow>${config.decks.maxOfOneLegendary}</yellow>`);

    game.log("#");

    game.log("# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid");
    game.log("# Valid decks will work properly");
    game.log("# Pseudo-valid decks will be rejected by the deck importer for violating a rule");
    game.log("# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.");
    game.log("# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.");

    game.log("#");

    game.log("#".repeat(config_text.length));
}

function findCard(card: string | number): Blueprint | null {
    let _card: Blueprint | null = null;

    Object.values(filtered_cards).forEach(c => {
        if (c.id == card || (typeof card === "string" && game.interact.getDisplayName(c).toLowerCase() == card.toLowerCase())) _card = c;
    });

    return _card!;
}

function add(card: Blueprint): boolean {
    deck.push(card);

    if (!card.deckSettings) return true;

    Object.entries(card.deckSettings).forEach(setting => {
        let [key, val] = setting;

        config[key as keyof GameConfig] = val as any;
    });

    return true;
}
function remove(card: Blueprint) {
    return game.functions.remove(deck, card);
}

function showDeck() {
    printName();

    game.log(`Deck Size: <yellow>${deck.length}</yellow>\n`);

    // Why are we doing this? Can't this be done better?
    let _cards: { [key: string]: [Blueprint, number] } = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    let bricks: string[] = [];

    Object.values(_cards).forEach(c => {
        let card = c[0];
        let amount = c[1];

        let viewed = "";

        if (amount > 1) viewed += `x${amount} `;
        viewed += game.interact.getDisplayName(card).replaceAll("-", "`") + ` - ${card.id}`;

        bricks.push(viewed);
    });

    let wall = game.functions.createWall(bricks, "-");

    wall.forEach(brick => {
        let brickSplit = brick.split("-");

        // Replace '`' with '-'
        brickSplit[0] = brickSplit[0].replaceAll("`", "-");

        let [nameAndAmount, id] = brickSplit;

        // Color name by rarity
        let r = /^x\d+ /;

        // Extract amount from name
        if (r.test(nameAndAmount)) {
            // Amount specified
            let amount = nameAndAmount.split(r);
            let card = findCard(nameAndAmount.replace(r, "").trim());
            if (!card) return; // TODO: Maybe throw an error?

            let name = game.functions.colorByRarity(amount[1], card.rarity);

            game.log(`${r.exec(nameAndAmount)}${name}-${id}`);
            return;
        }

        let card = findCard(nameAndAmount.trim());
        if (!card) return;

        let name = game.functions.colorByRarity(nameAndAmount, card.rarity);

        game.log(`${name}-${id}`);
    });

    game.log("\nCurrent deckcode output:");
    let _deckcode = deckcode();
    if (!_deckcode.error) {
        game.log("<bright:green>Valid deck!</>");
        game.log(_deckcode.code);
    }
}

function deckcode(parseVanillaOnPseudo = false) {
    let _deckcode = game.functions.deckcode.export(deck, chosen_class, runes);

    if (_deckcode.error) {
        let error = _deckcode.error;

        let log = "<yellow>WARNING: ";
        switch (error.msg) {
            case "TooFewCards":
                log += "Too few cards.";
                break;
            case "TooManyCards":
                log += "Too many cards.";
                break;
            case "EmptyDeck":
                log = "<red>ERROR: Could not generate deckcode as your deck is empty. The resulting deckcode would be invalid.</red>";
                break;
            case "TooManyCopies":
                log += util.format("Too many copies of a card. Maximum: </>'%s'<yellow>. Offender: </>'%s'<yellow>", config.decks.maxOfOneCard, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
                break;
            case "TooManyLegendaryCopies":
                log += util.format("Too many copies of a Legendary card. Maximum: </>'%s'<yellow>. Offender: </>'%s'<yellow>", config.decks.maxOfOneLegendary, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
                break;
        }

        game.log(log);
    }

    if (settings.deckcode.format == "vanilla" && (parseVanillaOnPseudo || !_deckcode.error)) _deckcode.code = game.functions.deckcode.toVanilla(plr, _deckcode.code);

    return _deckcode;
}

function help() {
    printName();

    // Commands
    game.log("<b>Available commands:</b>");
    game.log("(In order to run a command; input the name of the command and follow further instruction.)\n");
    game.log("(name) [optional] (required) - (description)\n");

    game.log("add (name | id)       - Add a card to the deck");
    game.log("remove (card | id)    - Remove a card from the deck");
    game.log("view (card | id)      - View a card");
    game.log("page (num)            - View a different page");
    game.log("cards (class)         - Show cards from 'class'");
    game.log("sort (type) [order]   - Sorts by 'type' in 'order'ending order. (Type can be: ('rarity', 'name', 'cost', 'id', 'type'), Order can be: ('asc', 'desc')) (Example: sort cost asc - Will show cards ordered by cost cost, ascending.)");
    game.log("search [query]        - Searches by query. Keys: ('name', 'desc', 'cost', 'rarity', 'id'), Examples: (search the - Search for all cards with the word 'the' in the name or description, case insensitive.), (search cost:2 - Search for all cards that costs 2 cost, search cost:even name:r - Search for all even cost cards with 'r' in its name)");
    game.log("undo                  - Undo the last action.");
    game.log("deck                  - Toggle deck-view");
    game.log("deckcode              - View the current deckcode");
    game.log("import                - Imports a deckcode (Overrides your deck)");
    game.log("set (setting) (value) - Change some settings. Look down to 'Set Subcommands' to see available settings");
    game.log("class                 - Change the class");
    game.log("config | rules        - Shows the rules for valid decks and invalid decks");
    game.log("help                  - Displays this message");
    game.log("exit                  - Quits the program");

    // Set
    game.log("\n<b>Set Subcommands:</>");
    game.log("(In order to use these; input 'set ', then one of the subcommands. Example: 'set cpp 20')\n");
    game.log("(name) [optional] (required) - (description)\n");

    game.log("format (format)             - Makes the deckcode generator output the deckcode as a different format. If you set this to 'vanilla', it is only going to show the deckcode as vanilla. If you set it to 'vanilla', you will be asked to choose a card if there are multiple vanilla cards with the same name. This should be rare, but just know that it might happen. ('js', 'vanilla') [default = 'js']");
    game.log("cardsPerPage | cpp (num)    - How many cards to show per page [default = 15]");
    game.log("defaultCommand | dcmd (cmd) - The command that should run when the command is unspecified. ('add', 'remove', 'view') [default = 'add']");
    game.log("warning                     - Disables/enables certain warnings. Look down to 'Warnings' to see changeable warnings.");

    game.log("\n<gray>Note the 'cardsPerPage' commands has 2 different subcommands; cpp & cardsPerPage. Both do the same thing.</>");

    // Set Warning
    game.log("\n<b>Warnings:</>");
    game.log("(In order to use these; input 'set warning (name) [off | on]'. Example: 'set warning latestCard off')\n");
    game.log("(name) - (description)\n");

    game.log("latestCard - Warning that shows up when attemping to use the latest card. The latest card is used if the card chosen in a command is invalid and the name specified begins with 'l'. Example: 'add latest' - Adds a copy of the latest card to the deck.");

    game.log("\nNote: If you don't specify a state (off / on) it will toggle the state of the warning.");
    game.log("Note: The word 'off' can be exchanged with 'disable', 'false', or '0'.");
    game.log("Note: The word 'on' can be exchanged with 'enable', 'true', or '1'.");

    // Notes
    game.log("\n<b>Notes:</>");

    game.log("Type 'cards Neutral' to see Neutral cards.");
    // TODO: #245 Fix this
    game.log("There is a known bug where if you add 'Prince Renathal', and then remove him, the deck will still require 40 cards. The only way around this is to restart the deck creator.");

    game.input("\nPress enter to continue...\n");
}

function getCardArg(cmd: string, callback: (card: Blueprint) => boolean, errorCallback: () => void): boolean {
    let times = 1;

    let cmdSplit = cmd.split(" ");
    cmdSplit.shift();

    // Get x2 from the cmd
    if (cmdSplit.length > 1 && parseInt(cmdSplit[0])) {
        times = parseInt(cmdSplit[0])
        cmdSplit.shift();
    }

    cmd = cmdSplit.join(" ");

    let eligibleForLatest = false;
    if (cmd.startsWith("l")) eligibleForLatest = true;

    let card = findCard(cmd);

    if (!card && eligibleForLatest) {
        if (warnings.latestCard) game.input(`<yellow>Card not found. Using latest valid card instead.</>`);
        card = game.functions.last(settings.card.history) ?? null;
    }

    if (!card) {
        game.input("<red>Invalid card.</>\n");
        return false;
    }

    for (let i = 0; i < times; i++) {
        if (!callback(card)) errorCallback();
    }

    settings.card.history.push(card);
    return true;
}

function handleCmds(cmd: string, addToHistory = true): boolean {
    if (findCard(cmd)) {
        // You just typed the name of a card.
        return handleCmds(`${settings.commands.default} ${cmd}`);
    }

    let args = cmd.split(" ");
    let name = args.shift()?.toLowerCase();
    if (!name) {
        game.input("<red>Invalid command.</red>\n");
        return false;
    }

    if (name === "config" || name === "rules") {
        printName();
        showRules();
        game.input("\nPress enter to continue...\n");
    }
    else if (name === "view") {
        // The callback function doesn't return anything, so we don't do anything with the return value of `getCardArg`.
        getCardArg(cmd, (card) => {
            game.interact.viewCard(card);
            return true;
        }, () => {});
    }
    else if (name === "cards") {
        if (args.length <= 0) return false;

        let heroClass = args.join(" ") as CardClass;
        heroClass = game.functions.capitalizeAll(heroClass) as CardClass;

        if (!classes.includes(heroClass as CardClassNoNeutral) && heroClass != "Neutral") {
            game.input("<red>Invalid class!</>\n");
            return false;
        }

        let correctClass = game.functions.validateClasses([chosen_class], heroClass);
        if (!correctClass) {
            game.input(`<yellow>Class '${heroClass}' is a different class. To see these cards, please switch class from '${chosen_class}' to '${heroClass}' to avoid confusion.</>\n`);
            return false;
        }

        settings.view.class = heroClass as CardClass;
    }
    else if (name === "deckcode") {
        let _deckcode = deckcode(true);

        let toPrint = _deckcode.code + "\n";
        if (_deckcode.error && !_deckcode.error.recoverable) toPrint = "";

        game.input(toPrint);
    }
    else if (name === "sort") {
        if (args.length <= 0) return false;

        settings.sort.type = args[0] as keyof Blueprint;
        if (args.length > 1) settings.sort.order = args[1] as "asc" | "desc";
    }
    else if (name === "search") {
        if (args.length <= 0) {
            settings.search.query = [];
            return false;
        }

        settings.search.query = args;
    }
    else if (name === "deck") {
        settings.view.type = settings.view.type == "cards" ? "deck" : "cards";
    }
    else if (name === "import") {
        // TODO: Make sure it works
        let _deckcode = game.input("Please input a deckcode: ");

        let _deck = game.functions.deckcode.import(plr, _deckcode);
        if (!_deck) return false;

        config.decks.validate = false;
        _deck = _deck.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        config.decks.validate = true;

        deck = [];

        // Update the filtered cards
        chosen_class = plr.heroClass as CardClassNoNeutral;
        runes = plr.runes;
        showCards();

        // Add the cards using handleCmds instead of add because for some reason, adding them with add
        // causes a weird bug that makes modifying the deck impossible because removing a card
        // removes a completly unrelated card because javascript.
        // You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.
        _deck.forEach(c => handleCmds(`add ${game.interact.getDisplayName(c)}`));
    }
    else if (name === "class") {
        let _runes = runes;
        let new_class = askClass();

        if (new_class == chosen_class && runes == _runes) {
            game.input("<yellow>Your class was not changed</>\n");
            return false;
        }

        deck = [];
        chosen_class = new_class as CardClassNoNeutral;
        if (settings.view.class != "Neutral") settings.view.class = chosen_class;
    }
    else if (name === "undo") {
        if (settings.commands.undoableHistory.length <= 0) {
            game.input("<red>Nothing to undo.</>\n");
            return false;
        }

        let commandSplit = game.functions.last(settings.commands.undoableHistory).split(" ");
        let args = commandSplit.slice(1);
        let command = commandSplit[0];

        let reverse;

        if (command.startsWith("a")) reverse = "remove";
        else if (command.startsWith("r")) reverse = "add";
        else {
            // This shouldn't ever happen, but oh well
            game.log(`<red>Command '${command}' cannot be undoed.</>`);
            return false;
        }

        handleCmds(`${reverse} ` + args.join(" "), false);

        settings.commands.undoableHistory.pop();
        settings.commands.history.pop();
    }
    else if (name === "set" && args[0] === "warning") {
        // Shift since the first element is "warning"
        args.shift();
        let key = args[0];

        if (!Object.keys(warnings).includes(key)) {
            game.input(`<red>'${key}' is not a valid warning!</>\n`);
            return false;
        }

        let new_state;

        if (args.length <= 1) {
            // Toggle
            new_state = !warnings[key];
        }
        else {
            let val = args[1];

            if (["off", "disable", "false", "no", "0"].includes(val)) new_state = false;
            else if (["on", "enable", "true", "yes", "1"].includes(val)) new_state = true;
            else {
                game.input(`<red>${val} is not a valid state. View 'help' for more information.</>\n`);
                return false;
            }
        }

        if (warnings[key] == new_state) {
            let strbuilder = "";

            strbuilder += "<yellow>Warning '</>";
            strbuilder += `<bright:yellow>${key}</>`;
            strbuilder += "<yellow>' is already ";
            strbuilder += (new_state) ? "enabled" : "disabled";
            strbuilder += ".</>\n";

            game.input(strbuilder);
            return false;
        }

        warnings[key] = new_state;

        let strbuilder = "";

        strbuilder += (new_state) ? "<bright:green>Enabled warning</>" : "<red>Disabled warning</>";
        strbuilder += "<yellow> '";
        strbuilder += key;
        strbuilder += "'.</>\n";

        game.input(strbuilder);
    }
    else if (name === "set") {
        if (args.length <= 0) {
            game.log("<yellow>Too few arguments</yellow>");
            game.input();
            return false;
        }

        let setting = args[0];

        switch (setting) {
            case "format":
                if (args.length == 0) {
                    settings.deckcode.format = "js";
                    game.log("Reset deckcode format to: <yellow>js</>");
                    break;
                }

                if (!["vanilla", "js"].includes(args[0])) {
                    game.log("<red>Invalid format!</red>");
                    game.input();
                    return false;
                }

                settings.deckcode.format = args[0] as "vanilla" | "js";
                game.log(`Set deckcode format to: <yellow>${args[0]}</yellow>`);
                break;
            case "cpp":
            case "cardsPerPage":
                if (args.length == 0) {
                    settings.view.cpp = 15;
                    game.log("Reset cards per page to: <yellow>15</yellow>");
                    break;
                }

                settings.view.cpp = parseInt(args[0]);
                break;
            case "dcmd":
            case "defaultCommand":
                if (args.length == 0) {
                    settings.commands.default = "add";
                    game.log("Set default command to: <yellow>add</yellow>");
                    break;
                }

                if (!["add", "remove", "view"].includes(args[0])) return false;
                let cmd = args[0];

                settings.commands.default = cmd;
                game.log(`Set default command to: <yellow>${cmd}</yellow>`);
                break;
            default:
                game.input(`<red>'${setting}' is not a valid setting.</red>\n`);
                return false;
        }

        game.input("<bright:green>Setting successfully changed!<bright:green>\n");
    }
    else if (name === "help") {
        help();
    }
    else if (name === "exit") {
        running = false;
    }
    else if (name.startsWith("a")) {
        let success = true;

        getCardArg(cmd, add, () => {
            // Internal error since add shouldn't return false
            game.log("<red>Internal Error: Something went wrong while adding a card. Please report this. Error code: DcAddInternal</>");
            game.input();

            success = false;
        });

        if (!success) return false;
    }
    else if (name.startsWith("r")) {
        let success = true;

        getCardArg(cmd, remove, () => {
            // User error
            game.log("<red>Invalid card.</red>");
            game.input();

            success = false;
        });

        if (!success) return false;
    }
    else if (cmd.startsWith("p")) {
        let page = parseInt(args.join(" "));
        if (!page) return false;

        if (page < 1) page = 1;
        settings.view.page = page;
    }
    else {
        // Infer add
        const tryCommand = `${settings.commands.default} ${cmd}`;
        game.log(`<yellow>Unable to find command. Trying '${tryCommand}'</yellow>`);
        return handleCmds(tryCommand);
    }

    if (!addToHistory) return true;

    settings.commands.history.push(cmd);
    if (["a", "r"].includes(cmd[0])) settings.commands.undoableHistory.push(cmd);
    return true;
}

let running = true;

/**
 * Runs the deck creator.
 */
export function main() {
    running = true;
    game.functions.importCards();

    chosen_class = askClass();

    while (running) {
        if (settings.view.type == "cards") showCards();
        else if (settings.view.type == "deck") showDeck();
        handleCmds(game.input("\n> "));
    }
}

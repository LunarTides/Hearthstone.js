/**
 * This is the deck creator.
 * @module Deck Creator
 */
import util from "util";

import { createGame } from "../src/internal.js";
import { Blueprint, CardClass, CardClassNoNeutral } from "../src/types.js";

const { game, player1: plr, player2 } = createGame();

const config = game.config;
const classes = game.functions.getClasses();
let cards = game.functions.getCards();

let chosen_class: CardClassNoNeutral;
let filtered_cards: Blueprint[] = [];

let deck: Blueprint[] = [];
let runes = "";

let warnings = {
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
        cpp: 15 // Cards per page
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
    game.logLocale("DeckCreator.Watermark");
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
    if (!["asc", "desc"].includes(settings.sort.order)) settings.sort.order = "asc"; // If the order is invalid, fall back to ascending

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

        if (!ret && ret !== 0) { // Javascript
            game.logLocale("DeckCreator.Error.InvalidKey", key);
            return -1;
        }

        // Mana even / odd
        if (key == "cost") {
            // Mana range
            let regex = /\d+-\d+/; // 1-10
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
                game.logLocale("DeckCreator.Error.InvalidValue", val);
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
    game.logLocale("DeckCreator.Error.NoCardsTotal");

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
        game.logLocale("DeckCreator.Error.NoCardsForSelectedClass", chosen_class);
    }

    let cpp = settings.view.cpp;
    let page = settings.view.page;

    // Search

    if (settings.search.query.length > 0) game.logLocale("DeckCreator.SearchingFor", settings.search.query.join(' '));

    // Filter to show only cards in the viewed class
    let classCards = Object.values(filtered_cards).filter(c => c.classes.includes(settings.view.class ?? chosen_class));

    if (classCards.length <= 0) {
        game.logLocale("DeckCreator.Error.NoCardsForViewedClass", settings.view.class);
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
    game.logLocale("DeckCreator.SortingBy", settings.sort.type.toUpperCase(), settings.sort.order);

    // Sort
    classCards = sortCards(classCards);

    let sortTypeInvalid = oldSortType != settings.sort.type;
    let sortOrderInvalid = oldSortOrder != settings.sort.order;

    if (sortTypeInvalid) {
        game.logLocale("DeckCreator.Error.FailedSortingByType", oldSortType.toUpperCase(), settings.sort.type.toUpperCase());
    }
    if (sortOrderInvalid) {
        game.logLocale("DeckCreator.Error.FailedSortingByOrder", oldSortOrder, settings.sort.order);
    }

    if (sortTypeInvalid || sortOrderInvalid) game.logLocale("DeckCreator.SortingBy", settings.sort.type.toUpperCase(), settings.sort.order);

    // Page logic
    classCards = classCards.slice(cpp * (page - 1), cpp * page);

    // Loop
    game.logLocale("DeckCreator.PageInfo", page, settings.view.maxPage);
    game.logLocale("DeckCreator.ClassInfo", settings.view.class);

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

    game.logLocale("DeckCreator.DeckcodeOutput.CurrentMessage");
    let _deckcode = deckcode();

    if (!_deckcode.error) {
        game.logLocale("DeckCreator.DeckcodeOutput.Valid");
        game.log(_deckcode.code);
    }

    if (settings.other.firstScreen) {
        game.logLocale("DeckCreator.Rules.CallToAction");

        settings.other.firstScreen = false;
    }
}

function showRules() {
    let config_text = game.locale.DeckCreator.Rules.Text;
    game.log("#".repeat(config_text.length));
    game.logLocale("DeckCreator.Rules.Text");
    game.log("#".repeat(config_text.length));

    game.log("#");

    game.logLocale("DeckCreator.Rules.Validation", (config.decks.validate ? game.locale.Other.On : game.locale.Other.Off));

    game.log("#");

    game.logLocale("DeckCreator.Rules.MinimumDeckLength", config.decks.minLength);
    game.logLocale("DeckCreator.Rules.MaximumDeckLength", config.decks.maxLength);

    game.log("#");

    game.logLocale("DeckCreator.Rules.MaxOfOneCard", config.decks.maxOfOneCard);
    game.logLocale("DeckCreator.Rules.MaxOfOneLegendary", config.decks.maxOfOneLegendary);

    game.log("#");

    game.logLocale("DeckCreator.Rules.Explanation");

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

        // @ts-expect-error
        config[key] = val;
    });

    return true;
}
function remove(card: Blueprint) {
    return game.functions.remove(deck, card);
}

function showDeck() {
    printName();

    game.logLocale("DeckCreator.DeckSize", deck.length);

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
        brickSplit[0] = brickSplit[0].replaceAll("`", "-"); // Replace '`' with '-'

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

    game.logLocale("DeckCreator.DeckcodeOutput.CurrentMessage");
    let _deckcode = deckcode();
    if (!_deckcode.error) {
        game.logLocale("DeckCreator.DeckcodeOutput.Valid");
        game.log(_deckcode.code);
    }
}

function deckcode(parseVanillaOnPseudo = false) {
    let _deckcode = game.functions.deckcode.export(deck, chosen_class, runes);

    if (_deckcode.error) {
        let error = _deckcode.error;

        let log = game.locale.DeckCreator.Error.Deckcode.Intro;
        switch (error.msg) {
            case "TooFewCards":
                log += game.locale.DeckCreator.Error.Deckcode.TooFewCards;
                break;
            case "TooManyCards":
                log += game.locale.DeckCreator.Error.Deckcode.TooManyCards;
                break;
            case "EmptyDeck":
                log = game.locale.DeckCreator.Error.Deckcode.EmptyDeck;
                break;
            case "TooManyCopies":
                log += util.format(game.locale.DeckCreator.Error.Deckcode.TooManyCopies, config.decks.maxOfOneCard, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
                break;
            case "TooManyLegendaryCopies":
                log += util.format(game.locale.DeckCreator.Error.Deckcode.TooManyLegendaryCopies, config.decks.maxOfOneLegendary, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
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
    game.logLocale("DeckCreator.Commands.Intro.Text");
    game.logLocale("Generic.Commands.HowToRun");
    game.logLocale("Generic.Commands.Format");

    game.logLocale("DeckCreator.Commands.Add");
    game.logLocale("DeckCreator.Commands.Remove");
    game.logLocale("DeckCreator.Commands.View");
    game.logLocale("DeckCreator.Commands.Page");
    game.logLocale("DeckCreator.Commands.Cards");
    game.logLocale("DeckCreator.Commands.Sort");
    game.logLocale("DeckCreator.Commands.Search");
    game.logLocale("DeckCreator.Commands.Undo");
    game.logLocale("DeckCreator.Commands.Deck");
    game.logLocale("DeckCreator.Commands.Deckcode");
    game.logLocale("DeckCreator.Commands.Import");
    game.logLocale("DeckCreator.Commands.Set");
    game.logLocale("DeckCreator.Commands.Class");
    game.logLocale("DeckCreator.Commands.Config");
    game.logLocale("DeckCreator.Commands.Help");
    game.logLocale("DeckCreator.Commands.Exit");

    // Set
    game.logLocale("DeckCreator.Commands.SetSubcommands.Intro.Text");
    game.logLocale("DeckCreator.Commands.SetSubcommands.Intro.HowToRun");
    game.logLocale("Generic.Commands.Format");

    game.logLocale("DeckCreator.Commands.SetSubcommands.Format");
    game.logLocale("DeckCreator.Commands.SetSubcommands.CardsPerPage");
    game.logLocale("DeckCreator.Commands.SetSubcommands.DefaultCommand");
    game.logLocale("DeckCreator.Commands.SetSubcommands.Warning.LessInfo");

    game.log()
    game.logLocale("DeckCreator.Commands.Notes.Scattered.DifferentSubcommands");

    // Set Warning
    game.logLocale("DeckCreator.Commands.SetSubcommands.Warning.Intro.Text");
    game.logLocale("DeckCreator.Commands.SetSubcommands.Warning.Intro.HowToRun");
    game.logLocale("Generic.Commands.Format");

    game.logLocale("DeckCreator.Commands.SetSubcommands.Warning.LatestCard");

    game.log();
    game.logLocale("DeckCreator.Commands.Notes.Scattered.WarningState");
    game.logLocale("DeckCreator.Commands.Notes.Scattered.WarningStateOff");
    game.logLocale("DeckCreator.Commands.Notes.Scattered.WarningStateOn");

    // Notes
    game.log();
    game.logLocale("DeckCreator.Commands.Notes.Section.Intro.Text");

    game.logLocale("DeckCreator.Commands.Notes.Section.NeutralCards");
    // TODO: #245 Fix this
    game.logLocale("DeckCreator.Commands.Notes.Section.PrinceRenathalBug");

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
    let name = args[0].toLowerCase();
    args.shift();

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
        _deck.forEach(c => handleCmds(`add ${game.interact.getDisplayName(c)}`)); // You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.
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
            game.logLocale("DeckCreator.Error.Commands.UndoInvalidCommand", command);
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
            // @ts-expect-error
            new_state = !warnings[key]; // Toggle
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

        // @ts-expect-error
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

        // @ts-expect-error
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
            game.logLocale("Generic.Error.Commands.TooFewArgumentsWarning");
            game.input();
            return false;
        }

        let setting = args[0];

        switch (setting) {
            case "format":
                if (args.length == 0) {
                    settings.deckcode.format = "js";
                    game.logLocale("DeckCreator.Info.Commands.Set.ResetFormat", settings.deckcode.format);
                    break;
                }

                if (!["vanilla", "js"].includes(args[0])) {
                    game.logLocale("DeckCreator.Error.Commands.Set.InvalidFormat");
                    game.input();
                    return false;
                }

                settings.deckcode.format = args[0] as "vanilla" | "js";
                game.logLocale("DeckCreator.Info.Commands.Set.SetFormat", settings.deckcode.format);
                break;
            case "cpp":
            case "cardsPerPage":
                if (args.length == 0) {
                    settings.view.cpp = 15;
                    game.logLocale("DeckCreator.Info.Commands.Set.ResetCardsPerPage", settings.view.cpp);
                    break;
                }

                settings.view.cpp = parseInt(args[0]);
                break;
            case "dcmd":
            case "defaultCommand":
                if (args.length == 0) {
                    settings.commands.default = "add";
                    game.logLocale("DeckCreator.Info.Commands.Set.ResetDefaultCommand", settings.commands.default);
                    break;
                }

                if (!["add", "remove", "view"].includes(args[0])) return false;
                let cmd = args[0];

                settings.commands.default = cmd;
                game.logLocale("DeckCreator.Info.Commands.Set.SetDefaultCommand", settings.commands.default);
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
            game.logLocale("Generic.Error.Internal", "DcAddInternal");
            game.input();

            success = false;
        });

        if (!success) return false;
    }
    else if (name.startsWith("r")) {
        let success = true;

        getCardArg(cmd, remove, () => {
            // User error
            game.logLocale("Generic.Error.Card.Invalid");
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
        game.logLocale("DeckCreator.Error.Commands.InvalidCommand", tryCommand);
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
    game.functions.importCards(game.functions.dirname() + "cards");
    game.functions.importConfig();

    chosen_class = askClass();

    while (running) {
        if (settings.view.type == "cards") showCards();
        else if (settings.view.type == "deck") showDeck();
        handleCmds(game.input("\n> "));
    }
}

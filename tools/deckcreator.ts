/**
 * This is the deck creator.
 * @module Deck Creator
 */
import util from 'node:util';
import {type Card, createGame} from '../src/internal.js';
import {type CardClass, type CardClassNoNeutral, type GameConfig} from '../src/types.js';

const {game, player1: plr, player2} = createGame();

const {config} = game;
const classes = game.functions.card.getClasses();
const cards = game.functions.card.getAll(!game.config.advanced.dcShowUncollectible);

let chosenClass: CardClassNoNeutral;
let filteredCards: Card[] = [];

let deck: Card[] = [];
let runes = '';

const warnings: Record<string, boolean> = {
    latestCard: true,
};

type Settings = {
    card: {
        history: Card[];
    };
    view: {
        type: 'cards' | 'deck';
        page: number;
        maxPage?: number;
        cpp: number;
        class?: CardClass;
    };
    sort: {
        type: keyof Card;
        order: 'asc' | 'desc';
    };
    search: {
        query: string[];
        prevQuery: string[];
    };
    deckcode: {
        cardId: 'id' | 'name';
        format: 'js' | 'vanilla';
    };
    commands: {
        default: string;
        history: string[];
        undoableHistory: string[];
    };
    other: {
        firstScreen: boolean;
    };
};

const settings: Settings = {
    card: {
        history: [],
    },
    view: {
        type: 'cards',
        page: 1,
        // Cards per page
        cpp: 15,
    },
    sort: {
        type: 'rarity',
        order: 'asc',
    },
    search: {
        query: [],
        prevQuery: [],
    },
    deckcode: {
        cardId: 'id',
        format: 'js',
    },
    commands: {
        default: 'add',
        history: [],
        undoableHistory: [],
    },
    other: {
        firstScreen: true,
    },
};

const defaultSettings: Settings = game.lodash.cloneDeep(settings);

function printName() {
    game.interact.cls();
    game.log('Hearthstone.js Deck Creator (C) 2022\n');
}

function askClass(): CardClassNoNeutral {
    printName();

    let heroClass = game.input('What class do you want to choose?\n' + classes.join(', ') + '\n');
    if (heroClass) {
        heroClass = game.functions.util.capitalizeAll(heroClass);
    }

    if (!classes.includes(heroClass as CardClassNoNeutral)) {
        return askClass();
    }

    if (heroClass === 'Death Knight') {
        runes = '';

        while (runes.length < 3) {
            printName();

            const rune = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!rune || !['B', 'F', 'U'].includes(rune[0].toUpperCase())) {
                continue;
            }

            runes += rune[0].toUpperCase();
        }

        plr.runes = runes;
    }

    return heroClass as CardClassNoNeutral;
}

function sortCards(_cards: Card[]) {
    // If the order is invalid, fall back to ascending
    if (!['asc', 'desc'].includes(settings.sort.order)) {
        settings.sort.order = defaultSettings.sort.order;
    }

    const {type, order} = settings.sort;

    const calcOrder = (a: number, b: number) => {
        if (order === 'asc') {
            return a - b;
        }

        return b - a;
    };

    if (type === 'rarity') {
        const sortScores = ['Free', 'Common', 'Rare', 'Epic', 'Legendary'];

        return _cards.sort((a, b) => {
            const scoreA = sortScores.indexOf(a.rarity);
            const scoreB = sortScores.indexOf(b.rarity);

            return calcOrder(scoreA, scoreB);
        });
    }

    if (['name', 'type'].includes(type)) {
        return _cards.sort((a, b) => {
            let typeA;
            let typeB;

            if (type === 'name') {
                typeA = a.displayName;
                typeB = b.displayName;
            } else {
                typeA = a.type;
                typeB = b.type;
            }

            let returnValue = typeA.localeCompare(typeB);
            if (order === 'desc') {
                returnValue = -returnValue;
            }

            return returnValue;
        });
    }

    if (type === 'cost' || type === 'id') {
        const newType = type;

        return _cards.sort((a, b) => calcOrder(a[newType], b[newType]));
    }

    // If 'type' isn't valid, fall back to sorting by rarity
    settings.sort.type = defaultSettings.sort.type;
    return sortCards(_cards);
}

function searchCards(_cards: Card[], searchQuery: string) {
    if (searchQuery.length <= 0) {
        return _cards;
    }

    const returnValueCards: Card[] = [];

    const splitQuery = searchQuery.split(':');

    if (splitQuery.length <= 1) {
        // The user didn't specify a key. Do a general search
        const query = splitQuery[0].toLowerCase();

        for (const c of _cards) {
            const name = c.displayName.toLowerCase();
            const text = c.text.toLowerCase();

            if (!name.includes(query) && !text.includes(query)) {
                continue;
            }

            returnValueCards.push(c);
        }

        return returnValueCards;
    }

    let [key, value] = splitQuery;

    value = value.toLowerCase();

    const doReturn = (c: Card) => {
        const returnValue = c[key as keyof Card];

        // Javascript
        if (!returnValue && returnValue !== 0) {
            game.log(`\n<red>Key '${key}' not valid!</red>`);
            return -1;
        }

        // Mana even / odd
        if (key === 'cost') {
            if (typeof returnValue !== 'number') {
                throw new TypeError('`ret` is not a number.');
            }

            if (value === 'even') {
                return returnValue % 2 === 0;
            }

            if (value === 'odd') {
                return returnValue % 2 === 1;
            }

            // Mana range (1-10)
            const regex = /\d+-\d+/;
            if (regex.test(value)) {
                const _value = value.split('-');

                const min = game.lodash.parseInt(_value[0]);
                const max = game.lodash.parseInt(_value[1]);

                return returnValue >= min && returnValue <= max;
            }

            const parsedValue = game.lodash.parseInt(value);

            if (!Number.isNaN(parsedValue)) {
                return returnValue === parsedValue;
            }

            game.log(`\n<red>Value '${value}' not valid!</red>`);
            return -1;
        }

        if (typeof (returnValue) === 'string') {
            return returnValue.toLowerCase().includes(value);
        }

        if (typeof (returnValue) === 'number') {
            return returnValue === Number.parseFloat(value);
        }

        return -1;
    };

    let error = false;

    for (const c of _cards) {
        if (error) {
            continue;
        }

        const returnValue = doReturn(c);

        if (returnValue === -1) {
            error = true;
            continue;
        }

        if (returnValue) {
            returnValueCards.push(c);
        }
    }

    if (error) {
        return false;
    }

    return returnValueCards;
}

// eslint-disable-next-line complexity
function showCards() {
    filteredCards = [];
    printName();

    // If the user chose to view an invalid class, reset the viewed class to default.
    const correctClass = game.functions.card.validateClasses([settings.view.class ?? chosenClass], chosenClass);
    if (!settings.view.class || !correctClass) {
        settings.view.class = chosenClass;
    }

    // Filter away cards that aren't in the chosen class
    for (const c of Object.values(cards)) {
        if (c.runes && !plr.testRunes(c.runes)) {
            continue;
        }

        const correctClass = game.functions.card.validateClasses(c.classes, settings.view.class ?? chosenClass);
        if (correctClass) {
            filteredCards.push(c);
        }
    }

    if (filteredCards.length <= 0) {
        game.log(`<yellow>No cards found for the selected classes '${chosenClass} and Neutral'.</yellow>`);
    }

    const {cpp} = settings.view;
    let {page} = settings.view;

    // Search

    if (settings.search.query.length > 0) {
        game.log(`Searching for '${settings.search.query.join(' ')}'.`);
    }

    // Filter to show only cards in the viewed class
    let classCards = Object.values(filteredCards).filter(c => c.classes.includes(settings.view.class ?? chosenClass));

    if (classCards.length <= 0) {
        game.log(`<yellow>No cards found for the viewed class '${settings.view.class}'.</yellow>`);
        return;
    }

    let searchFailed = false;

    // Search functionality
    for (const q of settings.search.query) {
        if (searchFailed) {
            continue;
        }

        const searchedCards = searchCards(classCards, q);

        if (searchedCards === false) {
            game.pause(`<red>Search failed at '${q}'! Reverting back to last successful query.\n</red>`);
            searchFailed = true;
            continue;
        }

        classCards = searchedCards;
    }

    if (classCards.length <= 0) {
        game.pause('<yellow>\nNo cards match search.\n</yellow>');
        searchFailed = true;
    }

    if (searchFailed) {
        settings.search.query = settings.search.prevQuery;
        showCards();
        return;
    }

    settings.search.prevQuery = settings.search.query;

    settings.view.maxPage = Math.ceil(classCards.length / cpp);
    if (page > settings.view.maxPage) {
        page = settings.view.maxPage;
    }

    const oldSortType = settings.sort.type;
    const oldSortOrder = settings.sort.order;
    game.log(`Sorting by ${settings.sort.type.toUpperCase()}, ${settings.sort.order}ending.`);

    // Sort
    classCards = sortCards(classCards);

    const sortTypeInvalid = oldSortType !== settings.sort.type;
    const sortOrderInvalid = oldSortOrder !== settings.sort.order;

    if (sortTypeInvalid) {
        game.log('<yellow>Sorting by </yellow>\'%s\'<yellow> failed! Falling back to </yellow>%s.', oldSortType.toUpperCase(), settings.sort.type.toUpperCase());
    }

    if (sortOrderInvalid) {
        game.log('<yellow>Ordering by </yellow>\'%sending\'<yellow> failed! Falling back to </yellow>%sending.', oldSortOrder, settings.sort.order);
    }

    if (sortTypeInvalid || sortOrderInvalid) {
        game.log(`\nSorting by ${settings.sort.type.toUpperCase()}, ${settings.sort.order}ending.`);
    }

    // Page logic
    classCards = classCards.slice(cpp * (page - 1), cpp * page);

    // Loop
    game.log(`\nPage ${page} / ${settings.view.maxPage}\n`);

    game.log(`<underline>${settings.view.class}</underline>`);

    const bricks: string[] = [];
    for (const c of classCards) {
        bricks.push(c.displayName + ' - ' + c.id);
    }

    const wall = game.functions.util.createWall(bricks, '-');

    for (const brick of wall) {
        const brickSplit = brick.split('-');

        // Find the card before the '-'
        const card = findCard(brickSplit[0].trim());
        if (!card) {
            continue;
        }

        // The card's name should be colored, while the id should not
        // I don't add colors above, since createWall breaks when colors are used.
        const toDisplay = game.functions.color.fromRarity(brickSplit[0], card.rarity) + '-' + brickSplit[1];

        game.log(toDisplay);
    }

    game.log('\nCurrent deckcode output:');
    const _deckcode = deckcode();

    if (!_deckcode.error) {
        game.log('<bright:green>Valid deck!</bright:green>');
        game.log(_deckcode.code);
    }

    if (settings.other.firstScreen) {
        game.log('\nType \'rules\' to see a list of rules.');

        settings.other.firstScreen = false;
    }
}

function showRules() {
    const configText = '### RULES ###';
    game.log('#'.repeat(configText.length));
    game.log(configText);
    game.log('#'.repeat(configText.length));

    game.log('#');

    game.log('# Validation: %s', (config.decks.validate ? '<bright:green>ON</bright:green>' : '<red>OFF</red>'));

    game.log(`#\n# Rule 1. Minimum Deck Length: <yellow>${config.decks.minLength}</yellow>`);
    game.log(`# Rule 2. Maximum Deck Length: %s <yellow>${config.decks.maxLength}</yellow>`);

    game.log(`#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: <yellow>x</yellow> Seances in a deck): <yellow>${config.decks.maxOfOneCard}</yellow>`);
    game.log(`# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): <yellow>${config.decks.maxOfOneLegendary}</yellow>`);

    game.log('#');

    game.log('# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid');
    game.log('# Valid decks will work properly');
    game.log('# Pseudo-valid decks will be rejected by the deck importer for violating a rule');
    game.log('# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.');
    game.log('# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.');

    game.log('#');

    game.log('#'.repeat(configText.length));
}

function findCard(card: string): Card | undefined {
    let _card: Card | undefined;

    for (const c of Object.values(filteredCards)) {
        if (c.id === game.lodash.parseInt(card) || (typeof card === 'string' && c.displayName.toLowerCase() === card.toLowerCase())) {
            _card = c;
        }
    }

    return _card!;
}

function add(card: Card): boolean {
    deck.push(card);

    if (!card.deckSettings) {
        return true;
    }

    for (const setting of Object.entries(card.deckSettings)) {
        const [key, value] = setting;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        config[key as keyof GameConfig] = value as any;
    }

    return true;
}

function remove(card: Card) {
    return game.functions.util.remove(deck, card);
}

function showDeck() {
    printName();

    game.log(`Deck Size: <yellow>${deck.length}</yellow>\n`);

    // Why are we doing this? Can't this be done better?
    const _cards: Record<string, [Card, number]> = {};

    for (const c of deck) {
        if (!_cards[c.name]) {
            _cards[c.name] = [c, 0];
        }

        _cards[c.name][1]++;
    }

    const bricks: string[] = [];

    for (const c of Object.values(_cards)) {
        const card = c[0];
        const amount = c[1];

        let viewed = '';

        if (amount > 1) {
            viewed += `x${amount} `;
        }

        viewed += card.displayName.replaceAll('-', '`') + ` - ${card.id}`;

        bricks.push(viewed);
    }

    const wall = game.functions.util.createWall(bricks, '-');

    for (const brick of wall) {
        const brickSplit = brick.split('-');

        // Replace '`' with '-'
        brickSplit[0] = brickSplit[0].replaceAll('`', '-');

        const [nameAndAmount, id] = brickSplit;

        // Color name by rarity
        const r = /^x\d+ /;

        // Extract amount from name
        if (r.test(nameAndAmount)) {
            // Amount specified
            const amount = nameAndAmount.split(r);
            const card = findCard(nameAndAmount.replace(r, '').trim());

            // TODO: Maybe throw an error?
            if (!card) {
                continue;
            }

            const name = game.functions.color.fromRarity(amount[1], card.rarity);

            const amountString = r.exec(nameAndAmount) ?? 'undefined';
            game.log(`${amountString as string}${name}-${id}`);
            continue;
        }

        const card = findCard(nameAndAmount.trim());
        if (!card) {
            continue;
        }

        const name = game.functions.color.fromRarity(nameAndAmount, card.rarity);

        game.log(`${name}-${id}`);
    }

    game.log('\nCurrent deckcode output:');
    const _deckcode = deckcode();
    if (!_deckcode.error) {
        game.log('<bright:green>Valid deck!</bright:green>');
        game.log(_deckcode.code);
    }
}

function deckcode(parseVanillaOnPseudo = false) {
    const _deckcode = game.functions.deckcode.export(deck, chosenClass, runes);

    if (_deckcode.error) {
        const {error} = _deckcode;

        let log = '<yellow>WARNING: ';
        switch (error.msg) {
            case 'TooFewCards': {
                log += 'Too few cards.';
                break;
            }

            case 'TooManyCards': {
                log += 'Too many cards.';
                break;
            }

            case 'EmptyDeck': {
                log = '<red>ERROR: Could not generate deckcode as your deck is empty. The resulting deckcode would be invalid.</red>';
                break;
            }

            case 'TooManyCopies': {
                log += util.format('Too many copies of a card. Maximum: </yellow>\'%s\'<yellow>. Offender: </yellow>\'%s\'<yellow>', config.decks.maxOfOneCard, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
                break;
            }

            case 'TooManyLegendaryCopies': {
                log += util.format('Too many copies of a Legendary card. Maximum: </yellow>\'%s\'<yellow>. Offender: </yellow>\'%s\'<yellow>', config.decks.maxOfOneLegendary, `{ Name: "${error.info?.card?.name}", Copies: "${error.info?.amount}" }`);
                break;
            }

            default: {
                throw new Error('invalid error message found');
            }
        }

        game.log(log);
    }

    if (settings.deckcode.format === 'vanilla' && (parseVanillaOnPseudo || !_deckcode.error)) {
        _deckcode.code = game.functions.deckcode.toVanilla(plr, _deckcode.code);
    }

    return _deckcode;
}

function help() {
    printName();

    // Commands
    game.log('<b>Available commands:</b>');
    game.log('(In order to run a command; input the name of the command and follow further instruction.)\n');
    game.log('(name) [optional] (required) - (description)\n');

    game.log('add (name | id)       - Add a card to the deck');
    game.log('remove (card | id)    - Remove a card from the deck');
    game.log('view (card | id)      - View a card');
    game.log('page (num)            - View a different page');
    game.log('cards (class)         - Show cards from \'class\'');
    game.log('sort (type) [order]   - Sorts by \'type\' in \'order\'ending order. (Type can be: (\'rarity\', \'name\', \'cost\', \'id\', \'type\'), Order can be: (\'asc\', \'desc\')) (Example: sort cost asc - Will show cards ordered by cost cost, ascending.)');
    game.log('search [query]        - Searches by query. Keys: (\'name\', \'text\', \'cost\', \'rarity\', \'id\'), Examples: (search the - Search for all cards with the word \'the\' in the name or description, case insensitive.), (search cost:2 - Search for all cards that costs 2 cost, search cost:even name:r - Search for all even cost cards with \'r\' in its name)');
    game.log('undo                  - Undo the last action.');
    game.log('deck                  - Toggle deck-view');
    game.log('deckcode              - View the current deckcode');
    game.log('import                - Imports a deckcode (Overrides your deck)');
    game.log('set (setting) (value) - Change some settings. Look down to \'Set Subcommands\' to see available settings');
    game.log('class                 - Change the class');
    game.log('config | rules        - Shows the rules for valid decks and invalid decks');
    game.log('help                  - Displays this message');
    game.log('exit                  - Quits the program');

    // Set
    game.log('\n<b>Set Subcommands:</b>');
    game.log('(In order to use these; input \'set \', then one of the subcommands. Example: \'set cpp 20\')\n');
    game.log('(name) [optional] (required) - (description)\n');

    game.log('format (format)             - Makes the deckcode generator output the deckcode as a different format. If you set this to \'vanilla\', it is only going to show the deckcode as vanilla. If you set it to \'vanilla\', you will be asked to choose a card if there are multiple vanilla cards with the same name. This should be rare, but just know that it might happen. (\'js\', \'vanilla\') [default = \'js\']');
    game.log('cardsPerPage | cpp (num)    - How many cards to show per page [default = 15]');
    game.log('defaultCommand | dcmd (cmd) - The command that should run when the command is unspecified. (\'add\', \'remove\', \'view\') [default = \'add\']');
    game.log('warning                     - Disables/enables certain warnings. Look down to \'Warnings\' to see changeable warnings.');

    game.log('\n<gray>Note the \'cardsPerPage\' commands has 2 different subcommands; cpp & cardsPerPage. Both do the same thing.</gray>');

    // Set Warning
    game.log('\n<b>Warnings:</b>');
    game.log('(In order to use these; input \'set warning (name) [off | on]\'. Example: \'set warning latestCard off\')\n');
    game.log('(name) - (description)\n');

    game.log('latestCard - Warning that shows up when attemping to use the latest card. The latest card is used if the card chosen in a command is invalid and the name specified begins with \'l\'. Example: \'add latest\' - Adds a copy of the latest card to the deck.');

    game.log('\nNote: If you don\'t specify a state (off / on) it will toggle the state of the warning.');
    game.log('Note: The word \'off\' can be exchanged with \'disable\', \'false\', or \'0\'.');
    game.log('Note: The word \'on\' can be exchanged with \'enable\', \'true\', or \'1\'.');

    // Notes
    game.log('\n<b>Notes:</b>');

    game.log('Type \'cards Neutral\' to see Neutral cards.');
    // TODO: #245 Fix this
    game.log('There is a known bug where if you add \'Prince Renathal\', and then remove him, the deck will still require 40 cards. The only way around this is to restart the deck creator.');

    game.pause('\nPress enter to continue...\n');
}

function getCardArg(cmd: string, callback: (card: Card) => boolean, errorCallback: () => void): boolean {
    let times = 1;

    const cmdSplit = cmd.split(' ');
    cmdSplit.shift();

    const cardFromFullString = findCard(cmdSplit.join(' '));

    // Get x2 from the cmd
    if (cmdSplit.length > 1 && game.lodash.parseInt(cmdSplit[0]) && !cardFromFullString) {
        times = game.lodash.parseInt(cmdSplit[0], 10);
        cmdSplit.shift();
    }

    cmd = cmdSplit.join(' ');

    let eligibleForLatest = false;
    if (cmd.startsWith('l')) {
        eligibleForLatest = true;
    }

    let card = findCard(cmd);

    if (!card && eligibleForLatest) {
        if (warnings.latestCard) {
            game.pause('<yellow>Card not found. Using latest valid card instead.</yellow>');
        }

        card = game.lodash.last(settings.card.history);
    }

    if (!card) {
        game.pause('<red>Invalid card.</red>\n');
        return false;
    }

    for (let i = 0; i < times; i++) {
        if (!callback(card)) {
            errorCallback();
        }
    }

    settings.card.history.push(card);
    return true;
}

// eslint-disable-next-line complexity
function handleCmds(cmd: string, addToHistory = true): boolean {
    if (findCard(cmd)) {
        // You just typed the name of a card.
        return handleCmds(`${settings.commands.default} ${cmd}`);
    }

    const args = cmd.split(' ');
    const name = args.shift()?.toLowerCase();
    if (!name) {
        game.pause('<red>Invalid command.</red>\n');
        return false;
    }

    switch (name) {
        case 'config':
        case 'rules': {
            printName();
            showRules();
            game.pause('\nPress enter to continue...\n');

            break;
        }

        case 'view': {
            // The callback function doesn't return anything, so we don't do anything with the return value of `getCardArg`.
            getCardArg(cmd, card => {
                game.interact.card.view(card);
                return true;
            }, () => {
                // Pass
            });

            break;
        }

        case 'cards': {
            if (args.length <= 0) {
                return false;
            }

            let heroClass = args.join(' ') as CardClass;
            heroClass = game.functions.util.capitalizeAll(heroClass) as CardClass;

            if (!classes.includes(heroClass as CardClassNoNeutral) && heroClass !== 'Neutral') {
                game.pause('<red>Invalid class!</red>\n');
                return false;
            }

            const correctClass = game.functions.card.validateClasses([heroClass], chosenClass);
            if (!correctClass) {
                game.pause(`<yellow>Class '${heroClass}' is a different class. To see these cards, please switch class from '${chosenClass}' to '${heroClass}' to avoid confusion.</yellow>\n`);
                return false;
            }

            settings.view.class = heroClass;

            break;
        }

        case 'deckcode': {
            const _deckcode = deckcode(true);

            let toPrint = _deckcode.code + '\n';
            if (_deckcode.error && !_deckcode.error.recoverable) {
                toPrint = '';
            }

            game.pause(toPrint);

            break;
        }

        case 'sort': {
            if (args.length <= 0) {
                return false;
            }

            settings.sort.type = args[0] as keyof Card;
            if (args.length > 1) {
                settings.sort.order = args[1] as 'asc' | 'desc';
            }

            break;
        }

        case 'search': {
            if (args.length <= 0) {
                settings.search.query = [];
                return false;
            }

            settings.search.query = args;

            break;
        }

        case 'deck': {
            settings.view.type = settings.view.type === 'cards' ? 'deck' : 'cards';

            break;
        }

        case 'import': {
            const _deckcode = game.input('Please input a deckcode: ');

            let _deck = game.functions.deckcode.import(plr, _deckcode);
            if (!_deck) {
                return false;
            }

            config.decks.validate = false;
            _deck = _deck.sort((a, b) => a.name.localeCompare(b.name));
            config.decks.validate = true;

            deck = [];

            // Update the filtered cards
            chosenClass = plr.heroClass as CardClassNoNeutral;
            runes = plr.runes;
            showCards();

            // Add the cards using handleCmds instead of add because for some reason, adding them with add
            // causes a weird bug that makes modifying the deck impossible because removing a card
            // removes a completly unrelated card because javascript.
            // You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.
            for (const c of _deck) {
                handleCmds(`add ${c.displayName}`);
            }

            break;
        }

        case 'class': {
            const _runes = runes;
            const newClass = askClass();

            if (newClass === chosenClass && runes === _runes) {
                game.pause('<yellow>Your class was not changed</yellow>\n');
                return false;
            }

            deck = [];
            chosenClass = newClass;
            if (settings.view.class !== 'Neutral') {
                settings.view.class = chosenClass;
            }

            break;
        }

        case 'undo': {
            if (settings.commands.undoableHistory.length <= 0) {
                game.pause('<red>Nothing to undo.</red>\n');
                return false;
            }

            const commandSplit = game.lodash.last(settings.commands.undoableHistory)?.split(' ');
            if (!commandSplit) {
                game.pause('<red>Could not find anything to undo. This is a bug.</red>\n');
                return false;
            }

            const args = commandSplit.slice(1);
            const command = commandSplit[0];

            let reverse;

            if (command.startsWith('a')) {
                reverse = 'remove';
            } else if (command.startsWith('r')) {
                reverse = 'add';
            } else {
                // This shouldn't ever happen, but oh well
                game.log(`<red>Command '${command}' cannot be undoed.</red>`);
                return false;
            }

            handleCmds(`${reverse} ` + args.join(' '), false);

            settings.commands.undoableHistory.pop();
            settings.commands.history.pop();

            break;
        }

        default: { if (name === 'set' && args[0] === 'warning') {
            // Shift since the first element is "warning"
            args.shift();
            const key = args[0];

            if (!Object.keys(warnings).includes(key)) {
                game.pause(`<red>'${key}' is not a valid warning!</red>\n`);
                return false;
            }

            let newState;

            if (args.length <= 1) {
                // Toggle
                newState = !warnings[key];
            } else {
                const value = args[1];

                if (['off', 'disable', 'false', 'no', '0'].includes(value)) {
                    newState = false;
                } else if (['on', 'enable', 'true', 'yes', '1'].includes(value)) {
                    newState = true;
                } else {
                    game.pause(`<red>${value} is not a valid state. View 'help' for more information.</red>\n`);
                    return false;
                }
            }

            if (warnings[key] === newState) {
                const newStateName = newState ? 'enabled' : 'disabled';

                game.pause(`<yellow>Warning '<bright:yellow>${key}</bright:yellow>' is already ${newStateName}.</yellow>\n`);
                return false;
            }

            warnings[key] = newState;

            const newStateName = (newState) ? '<bright:green>Enabled warning</bright:green>' : '<red>Disabled warning</red>';
            game.pause(`${newStateName} <yellow>'${key}'</yellow>\n`);
        } else if (name === 'set') {
            if (args.length <= 0) {
                game.log('<yellow>Too few arguments</yellow>');
                game.pause();
                return false;
            }

            const setting = args.shift();

            switch (setting) {
                case 'format': {
                    if (args.length === 0) {
                        settings.deckcode.format = defaultSettings.deckcode.format;
                        game.log(`Reset deckcode format to: <yellow>${defaultSettings.deckcode.format}</yellow>`);
                        break;
                    }

                    if (!['vanilla', 'js'].includes(args[0])) {
                        game.log('<red>Invalid format!</red>');
                        game.pause();
                        return false;
                    }

                    settings.deckcode.format = args[0] as 'vanilla' | 'js';
                    game.log(`Set deckcode format to: <yellow>${args[0]}</yellow>`);
                    break;
                }

                case 'cpp':
                case 'cardsPerPage': {
                    if (args.length === 0) {
                        settings.view.cpp = defaultSettings.view.cpp;
                        game.log(`Reset cards per page to: <yellow>${defaultSettings.view.cpp}</yellow>`);
                        break;
                    }

                    settings.view.cpp = game.lodash.parseInt(args[0]);
                    break;
                }

                case 'dcmd':
                case 'defaultCommand': {
                    if (args.length === 0) {
                        settings.commands.default = defaultSettings.commands.default;
                        game.log(`Set default command to: <yellow>${defaultSettings.commands.default}</yellow>`);
                        break;
                    }

                    if (!['add', 'remove', 'view'].includes(args[0])) {
                        return false;
                    }

                    const cmd = args[0];

                    settings.commands.default = cmd;
                    game.log(`Set default command to: <yellow>${cmd}</yellow>`);
                    break;
                }

                default: {
                    game.pause(`<red>'${setting}' is not a valid setting.</red>\n`);
                    return false;
                }
            }

            game.pause('<bright:green>Setting successfully changed!<bright:green>\n');
        } else if (name === 'help') {
            help();
        } else if (game.interact.shouldExit(name)) {
            running = false;
        } else if (name.startsWith('a')) {
            let success = true;

            getCardArg(cmd, add, () => {
                // Internal error since add shouldn't return false
                game.log('<red>Internal Error: Something went wrong while adding a card. Please report this. Error code: DcAddInternal</red>');
                game.pause();

                success = false;
            });

            if (!success) {
                return false;
            }
        } else if (name.startsWith('r')) {
            let success = true;

            getCardArg(cmd, remove, () => {
                // User error
                game.log('<red>Invalid card.</red>');
                game.pause();

                success = false;
            });

            if (!success) {
                return false;
            }
        } else if (cmd.startsWith('p')) {
            let page = game.lodash.parseInt(args.join(' '));
            if (!page) {
                return false;
            }

            if (page < 1) {
                page = 1;
            }

            settings.view.page = page;
        } else {
            // Infer add
            const tryCommand = `${settings.commands.default} ${cmd}`;
            game.log(`<yellow>Unable to find command. Trying '${tryCommand}'</yellow>`);
            return handleCmds(tryCommand);
        }
        }
    }

    if (!addToHistory) {
        return true;
    }

    settings.commands.history.push(cmd);
    if (['a', 'r'].includes(cmd[0])) {
        settings.commands.undoableHistory.push(cmd);
    }

    return true;
}

let running = true;

/**
 * Runs the deck creator.
 */
export function main() {
    running = true;
    game.functions.card.importAll();

    chosenClass = askClass();

    while (running) {
        if (settings.view.type === 'cards') {
            showCards();
        } else if (settings.view.type === 'deck') {
            showDeck();
        }

        handleCmds(game.input('\n> '));
    }
}

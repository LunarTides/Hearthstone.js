/**
 * This is the deck creator.
 * @module Deck Creator
 */
import util from 'node:util';
import { type Card, createGame } from '../src/internal.js';
import { type CardClass, type CardClassNoNeutral, type GameConfig } from '../src/types.js';

const { game, player1 } = createGame();

const { config: CONFIG } = game;
const CLASSES = game.functions.card.getClasses();
const CARDS = game.functions.card.getAll(!game.config.advanced.dcShowUncollectible);

let chosenClass: CardClassNoNeutral;
let filteredCards: Card[] = [];

let deck: Card[] = [];
let runes = '';

const WARNINGS: Record<string, boolean> = {
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

const SETTINGS: Settings = {
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

const DEFAULT_SETTINGS: Settings = game.lodash.cloneDeep(SETTINGS);

function printName() {
    game.interact.cls();
    game.log('Hearthstone.js Deck Creator (C) 2022\n');
}

function askClass(): CardClassNoNeutral {
    printName();

    let heroClass = game.input('What class do you want to choose?\n' + CLASSES.join(', ') + '\n');
    if (heroClass) {
        heroClass = game.lodash.startCase(heroClass);
    }

    if (!CLASSES.includes(heroClass as CardClassNoNeutral)) {
        return askClass();
    }

    if (heroClass === 'Death Knight') {
        runes = '';

        while (runes.length < 3) {
            printName();

            const RUNE = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!RUNE || !['B', 'F', 'U'].includes(RUNE[0].toUpperCase())) {
                continue;
            }

            runes += RUNE[0].toUpperCase();
        }

        player1.runes = runes;
    }

    return heroClass as CardClassNoNeutral;
}

function sortCards(_cards: Card[]) {
    // If the order is invalid, fall back to ascending
    if (!['asc', 'desc'].includes(SETTINGS.sort.order)) {
        SETTINGS.sort.order = DEFAULT_SETTINGS.sort.order;
    }

    const { type: TYPE, order: ORDER } = SETTINGS.sort;

    const calcOrder = (a: number, b: number) => {
        if (ORDER === 'asc') {
            return a - b;
        }

        return b - a;
    };

    if (TYPE === 'rarity') {
        const SORT_SCORES = ['Free', 'Common', 'Rare', 'Epic', 'Legendary'];

        return _cards.sort((a, b) => {
            const SCORE_A = SORT_SCORES.indexOf(a.rarity);
            const SCORE_B = SORT_SCORES.indexOf(b.rarity);

            return calcOrder(SCORE_A, SCORE_B);
        });
    }

    if (['name', 'type'].includes(TYPE)) {
        return _cards.sort((a, b) => {
            let typeA;
            let typeB;

            if (TYPE === 'name') {
                typeA = a.displayName;
                typeB = b.displayName;
            } else {
                typeA = a.type;
                typeB = b.type;
            }

            let returnValue = typeA.localeCompare(typeB);
            if (ORDER === 'desc') {
                returnValue = -returnValue;
            }

            return returnValue;
        });
    }

    if (TYPE === 'cost' || TYPE === 'id') {
        const NEW_TYPE = TYPE;

        return _cards.sort((a, b) => calcOrder(a[NEW_TYPE], b[NEW_TYPE]));
    }

    // If 'type' isn't valid, fall back to sorting by rarity
    SETTINGS.sort.type = DEFAULT_SETTINGS.sort.type;
    return sortCards(_cards);
}

function searchCards(_cards: Card[], searchQuery: string) {
    if (searchQuery.length <= 0) {
        return _cards;
    }

    const RETURN_VALUE_CARDS: Card[] = [];

    const SPLIT_QUERY = searchQuery.split(':');

    if (SPLIT_QUERY.length <= 1) {
        // The user didn't specify a key. Do a general search
        const QUERY = SPLIT_QUERY[0].toLowerCase();

        for (const CARD of _cards) {
            const NAME = CARD.displayName.toLowerCase();
            const TEXT = CARD.text.toLowerCase();

            if (!NAME.includes(QUERY) && !TEXT.includes(QUERY)) {
                continue;
            }

            RETURN_VALUE_CARDS.push(CARD);
        }

        return RETURN_VALUE_CARDS;
    }

    let [key, value] = SPLIT_QUERY;

    value = value.toLowerCase();

    const doReturn = (c: Card) => {
        const RETURN_VALUE = c[key as keyof Card];

        // Javascript
        if (!RETURN_VALUE && RETURN_VALUE !== 0) {
            game.log(`\n<red>Key '${key}' not valid!</red>`);
            return -1;
        }

        // Mana even / odd
        if (key === 'cost') {
            if (typeof RETURN_VALUE !== 'number') {
                throw new TypeError('`ret` is not a number.');
            }

            if (value === 'even') {
                return RETURN_VALUE % 2 === 0;
            }

            if (value === 'odd') {
                return RETURN_VALUE % 2 === 1;
            }

            // Mana range (1-10)
            const REGEX = /\d+-\d+/;
            if (REGEX.test(value)) {
                const VALUE = value.split('-');

                const MIN = game.lodash.parseInt(VALUE[0]);
                const MAX = game.lodash.parseInt(VALUE[1]);

                return RETURN_VALUE >= MIN && RETURN_VALUE <= MAX;
            }

            const PARSED_VALUE = game.lodash.parseInt(value);

            if (!Number.isNaN(PARSED_VALUE)) {
                return RETURN_VALUE === PARSED_VALUE;
            }

            game.log(`\n<red>Value '${value}' not valid!</red>`);
            return -1;
        }

        if (typeof (RETURN_VALUE) === 'string') {
            return RETURN_VALUE.toLowerCase().includes(value);
        }

        if (typeof (RETURN_VALUE) === 'number') {
            return RETURN_VALUE === Number.parseFloat(value);
        }

        return -1;
    };

    let error = false;

    for (const CARD of _cards) {
        if (error) {
            continue;
        }

        const RETURN_VALUE = doReturn(CARD);

        if (RETURN_VALUE === -1) {
            error = true;
            continue;
        }

        if (RETURN_VALUE) {
            RETURN_VALUE_CARDS.push(CARD);
        }
    }

    if (error) {
        return false;
    }

    return RETURN_VALUE_CARDS;
}

// eslint-disable-next-line complexity
function showCards() {
    filteredCards = [];
    printName();

    // If the user chose to view an invalid class, reset the viewed class to default.
    const CORRECT_CLASS = game.functions.card.validateClasses([SETTINGS.view.class ?? chosenClass], chosenClass);
    if (!SETTINGS.view.class || !CORRECT_CLASS) {
        SETTINGS.view.class = chosenClass;
    }

    // Filter away cards that aren't in the chosen class
    for (const CARD of Object.values(CARDS)) {
        if (CARD.runes && !player1.testRunes(CARD.runes)) {
            continue;
        }

        const CORRECT_CLASS = game.functions.card.validateClasses(CARD.classes, SETTINGS.view.class ?? chosenClass);
        if (CORRECT_CLASS) {
            filteredCards.push(CARD);
        }
    }

    if (filteredCards.length <= 0) {
        game.log(`<yellow>No cards found for the selected classes '${chosenClass} and Neutral'.</yellow>`);
    }

    const { cpp: CARDS_PER_PAGE } = SETTINGS.view;
    let { page: PAGE } = SETTINGS.view;

    // Search

    if (SETTINGS.search.query.length > 0) {
        game.log(`Searching for '${SETTINGS.search.query.join(' ')}'.`);
    }

    // Filter to show only cards in the viewed class
    let classCards = Object.values(filteredCards).filter(c => c.classes.includes(SETTINGS.view.class ?? chosenClass));

    if (classCards.length <= 0) {
        game.log(`<yellow>No cards found for the viewed class '${SETTINGS.view.class}'.</yellow>`);
        return;
    }

    let searchFailed = false;

    // Search functionality
    for (const QUERY of SETTINGS.search.query) {
        if (searchFailed) {
            continue;
        }

        const SEARCHED_CARDS = searchCards(classCards, QUERY);

        if (SEARCHED_CARDS === false) {
            game.pause(`<red>Search failed at '${QUERY}'! Reverting back to last successful query.\n</red>`);
            searchFailed = true;
            continue;
        }

        classCards = SEARCHED_CARDS;
    }

    if (classCards.length <= 0) {
        game.pause('<yellow>\nNo cards match search.\n</yellow>');
        searchFailed = true;
    }

    if (searchFailed) {
        SETTINGS.search.query = SETTINGS.search.prevQuery;
        showCards();
        return;
    }

    SETTINGS.search.prevQuery = SETTINGS.search.query;

    SETTINGS.view.maxPage = Math.ceil(classCards.length / CARDS_PER_PAGE);
    if (PAGE > SETTINGS.view.maxPage) {
        PAGE = SETTINGS.view.maxPage;
    }

    const OLD_SORT_TYPE = SETTINGS.sort.type;
    const OLD_SORT_ORDER = SETTINGS.sort.order;
    game.log(`Sorting by ${SETTINGS.sort.type.toUpperCase()}, ${SETTINGS.sort.order}ending.`);

    // Sort
    classCards = sortCards(classCards);

    const SORT_TYPE_INVALID = OLD_SORT_TYPE !== SETTINGS.sort.type;
    const SORT_ORDER_INVALID = OLD_SORT_ORDER !== SETTINGS.sort.order;

    if (SORT_TYPE_INVALID) {
        game.log('<yellow>Sorting by </yellow>\'%s\'<yellow> failed! Falling back to </yellow>%s.', OLD_SORT_TYPE.toUpperCase(), SETTINGS.sort.type.toUpperCase());
    }

    if (SORT_ORDER_INVALID) {
        game.log('<yellow>Ordering by </yellow>\'%sending\'<yellow> failed! Falling back to </yellow>%sending.', OLD_SORT_ORDER, SETTINGS.sort.order);
    }

    if (SORT_TYPE_INVALID || SORT_ORDER_INVALID) {
        game.log(`\nSorting by ${SETTINGS.sort.type.toUpperCase()}, ${SETTINGS.sort.order}ending.`);
    }

    // Page logic
    classCards = classCards.slice(CARDS_PER_PAGE * (PAGE - 1), CARDS_PER_PAGE * PAGE);

    // Loop
    game.log(`\nPage ${PAGE} / ${SETTINGS.view.maxPage}\n`);

    game.log(`<underline>${SETTINGS.view.class}</underline>`);

    const BRICKS: string[] = [];
    for (const CARD of classCards) {
        BRICKS.push(CARD.displayName + ' - ' + CARD.id);
    }

    const WALL = game.functions.util.createWall(BRICKS, '-');

    for (const BRICK of WALL) {
        const BRICK_SPLIT = BRICK.split('-');

        // Find the card before the '-'
        const CARD = findCard(BRICK_SPLIT[0].trim());
        if (!CARD) {
            continue;
        }

        // The card's name should be colored, while the id should not
        // I don't add colors above, since createWall breaks when colors are used.
        const TO_DISPLAY = CARD.colorFromRarity(BRICK_SPLIT[0]) + '-' + BRICK_SPLIT[1];

        game.log(TO_DISPLAY);
    }

    game.log('\nCurrent deckcode output:');
    const DECKCODE = deckcode();

    if (!DECKCODE.error) {
        game.log('<bright:green>Valid deck!</bright:green>');
        game.log(DECKCODE.code);
    }

    if (SETTINGS.other.firstScreen) {
        game.log('\nType \'rules\' to see a list of rules.');

        SETTINGS.other.firstScreen = false;
    }
}

function showRules() {
    const CONFIG_TEXT = '### RULES ###';
    game.log('#'.repeat(CONFIG_TEXT.length));
    game.log(CONFIG_TEXT);
    game.log('#'.repeat(CONFIG_TEXT.length));

    game.log('#');

    game.log('# Validation: %s', (CONFIG.decks.validate ? '<bright:green>ON</bright:green>' : '<red>OFF</red>'));

    game.log(`#\n# Rule 1. Minimum Deck Length: <yellow>${CONFIG.decks.minLength}</yellow>`);
    game.log(`# Rule 2. Maximum Deck Length: %s <yellow>${CONFIG.decks.maxLength}</yellow>`);

    game.log(`#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: <yellow>x</yellow> Seances in a deck): <yellow>${CONFIG.decks.maxOfOneCard}</yellow>`);
    game.log(`# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): <yellow>${CONFIG.decks.maxOfOneLegendary}</yellow>`);

    game.log('#');

    game.log('# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid');
    game.log('# Valid decks will work properly');
    game.log('# Pseudo-valid decks will be rejected by the deck importer for violating a rule');
    game.log('# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.');
    game.log('# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.');

    game.log('#');

    game.log('#'.repeat(CONFIG_TEXT.length));
}

function findCard(card: string): Card | undefined {
    let RETURN_CARD: Card | undefined;

    for (const CARD of Object.values(filteredCards)) {
        if (CARD.id === game.lodash.parseInt(card) || (typeof card === 'string' && CARD.displayName.toLowerCase() === card.toLowerCase())) {
            RETURN_CARD = CARD;
        }
    }

    return RETURN_CARD;
}

function add(card: Card): boolean {
    deck.push(card);

    if (!card.deckSettings) {
        return true;
    }

    for (const SETTING of Object.entries(card.deckSettings)) {
        const [KEY, VALUE] = SETTING;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        CONFIG[KEY as keyof GameConfig] = VALUE as any;
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
    const CARDS: Record<string, [Card, number]> = {};

    for (const CARD of deck) {
        if (!CARDS[CARD.name]) {
            CARDS[CARD.name] = [CARD, 0];
        }

        CARDS[CARD.name][1]++;
    }

    const BRICKS: string[] = [];

    for (const CARD_OBJECT of Object.values(CARDS)) {
        const CARD = CARD_OBJECT[0];
        const AMOUNT = CARD_OBJECT[1];

        let viewed = '';

        if (AMOUNT > 1) {
            viewed += `x${AMOUNT} `;
        }

        viewed += CARD.displayName.replaceAll('-', '`') + ` - ${CARD.id}`;

        BRICKS.push(viewed);
    }

    const WALL = game.functions.util.createWall(BRICKS, '-');

    for (const BRICK of WALL) {
        const BRICK_SPLIT = BRICK.split('-');

        // Replace '`' with '-'
        BRICK_SPLIT[0] = BRICK_SPLIT[0].replaceAll('`', '-');

        const [NAME_AND_AMOUNT, ID] = BRICK_SPLIT;

        // Color name by rarity
        const REG = /^x\d+ /;

        // Extract amount from name
        if (REG.test(NAME_AND_AMOUNT)) {
            // Amount specified
            const AMOUNT = NAME_AND_AMOUNT.split(REG);
            const CARD = findCard(NAME_AND_AMOUNT.replace(REG, '').trim());

            // TODO: Maybe throw an error?
            if (!CARD) {
                continue;
            }

            const NAME = CARD.colorFromRarity(AMOUNT[1]);

            const AMOUNT_STRING = REG.exec(NAME_AND_AMOUNT) ?? 'undefined';
            game.log(`${AMOUNT_STRING as string}${NAME}-${ID}`);
            continue;
        }

        const CARD = findCard(NAME_AND_AMOUNT.trim());
        if (!CARD) {
            continue;
        }

        const NAME = CARD.colorFromRarity(NAME_AND_AMOUNT);

        game.log(`${NAME}-${ID}`);
    }

    game.log('\nCurrent deckcode output:');
    const DECKCODE = deckcode();
    if (!DECKCODE.error) {
        game.log('<bright:green>Valid deck!</bright:green>');
        game.log(DECKCODE.code);
    }
}

function deckcode(parseVanillaOnPseudo = false) {
    const DECKCODE = game.functions.deckcode.export(deck, chosenClass, runes);

    if (DECKCODE.error) {
        const { error: ERROR } = DECKCODE;

        let log = '<yellow>WARNING: ';
        switch (ERROR.msg) {
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
                log += util.format('Too many copies of a card. Maximum: </yellow>\'%s\'<yellow>. Offender: </yellow>\'%s\'<yellow>', CONFIG.decks.maxOfOneCard, `{ Name: "${ERROR.info?.card?.name}", Copies: "${ERROR.info?.amount}" }`);
                break;
            }

            case 'TooManyLegendaryCopies': {
                log += util.format('Too many copies of a Legendary card. Maximum: </yellow>\'%s\'<yellow>. Offender: </yellow>\'%s\'<yellow>', CONFIG.decks.maxOfOneLegendary, `{ Name: "${ERROR.info?.card?.name}", Copies: "${ERROR.info?.amount}" }`);
                break;
            }

            default: {
                throw new Error('invalid error message found');
            }
        }

        game.log(log);
    }

    if (SETTINGS.deckcode.format === 'vanilla' && (parseVanillaOnPseudo || !DECKCODE.error)) {
        // Don't convert if the error is unrecoverable
        if (DECKCODE.error && !DECKCODE.error.recoverable) {
            return DECKCODE;
        }

        DECKCODE.code = game.functions.deckcode.toVanilla(player1, DECKCODE.code);
    }

    return DECKCODE;
}

function help() {
    printName();

    // Commands
    game.log('<b>Available commands:</b>');
    game.log('(In order to run a command; input the name of the command and follow further instruction.)\n');

    const BRICKS = [
        '(name) [optional] (required) - (description)\n',

        'add (name | id) - Add a card to the deck',
        'remove (card | id) - Remove a card from the deck',
        'view (card | id) - View a card',
        'page (num) - View a different page',
        'cards (class) - Show cards from \'class\'',
        'sort (type) [order] - Sorts by \'type\' in \'order\'ending order. (Type can be: (\'rarity\', \'name\', \'cost\', \'id\', \'type\'), Order can be: (\'asc\', \'desc\')) (Example: sort cost asc - Will show cards ordered by cost cost, ascending.)',
        'search [query] - Searches by query. Keys: (\'name\', \'text\', \'cost\', \'rarity\', \'id\'), Examples: (search the - Search for all cards with the word \'the\' in the name or description, case insensitive.), (search cost:2 - Search for all cards that costs 2 cost, search cost:even name:r - Search for all even cost cards with \'r\' in its name)',
        'undo - Undo the last action.',
        'deck - Toggle deck-view',
        'deckcode - View the current deckcode',
        'import - Imports a deckcode (Overrides your deck)',
        'set (setting) (value) - Change some settings. Look down to \'Set Subcommands\' to see available settings',
        'class - Change the class',
        'config | rules - Shows the rules for valid decks and invalid decks',
        'help - Displays this message',
        'exit - Quits the program',
    ];

    const WALL = game.functions.util.createWall(BRICKS, '-');
    for (const BRICKS of WALL) {
        game.log(BRICKS);
    }

    // Set
    game.log('\n<b>Set Subcommands:</b>');
    game.log('(In order to use these; input \'set \', then one of the subcommands. Example: \'set cpp 20\')\n');

    const SET_SUBCOMMAND_BRICKS = [
        '(name) [optional] (required) - (description)\n',

        'format (format) - Makes the deckcode generator output the deckcode as a different format. If you set this to \'vanilla\', it is only going to show the deckcode as vanilla. If you set it to \'vanilla\', you will be asked to choose a card if there are multiple vanilla cards with the same name. This should be rare, but just know that it might happen. (\'js\', \'vanilla\') [default = \'js\']',
        'cardsPerPage | cpp (num) - How many cards to show per page [default = 15]',
        'defaultCommand | dcmd (cmd) - The command that should run when the command is unspecified. (\'add\', \'remove\', \'view\') [default = \'add\']',
        'warning - Disables/enables certain warnings. Look down to \'Warnings\' to see changeable warnings.',
    ];

    const SET_SUBCOMMAND_WALL = game.functions.util.createWall(SET_SUBCOMMAND_BRICKS, '-');
    for (const BRICK of SET_SUBCOMMAND_WALL) {
        game.log(BRICK);
    }

    game.log('\n<gray>Note the \'cardsPerPage\' commands has 2 different subcommands; cpp & cardsPerPage. Both do the same thing.</gray>');

    // Set Warning
    game.log('\n<b>Warnings:</b>');
    game.log('(In order to use these; input \'set warning (name) [off | on]\'. Example: \'set warning latestCard off\')\n');

    const WARNING_BRICKS = [
        '(name) - (description)\n',

        'latestCard - Warning that shows up when attemping to use the latest card. The latest card is used if the card chosen in a command is invalid and the name specified begins with \'l\'. Example: \'add latest\' - Adds a copy of the latest card to the deck.',
    ];

    const WARNING_WALL = game.functions.util.createWall(WARNING_BRICKS, '-');
    for (const BRICK of WARNING_WALL) {
        game.log(BRICK);
    }

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

    const COMMAND_SPLIT = cmd.split(' ');
    COMMAND_SPLIT.shift();

    const CARD_FROM_FULL_STRING = findCard(COMMAND_SPLIT.join(' '));

    // Get x2 from the cmd
    if (COMMAND_SPLIT.length > 1 && game.lodash.parseInt(COMMAND_SPLIT[0]) && !CARD_FROM_FULL_STRING) {
        times = game.lodash.parseInt(COMMAND_SPLIT[0], 10);
        COMMAND_SPLIT.shift();
    }

    cmd = COMMAND_SPLIT.join(' ');

    let eligibleForLatest = false;
    if (cmd.startsWith('l')) {
        eligibleForLatest = true;
    }

    let card = findCard(cmd);

    if (!card && eligibleForLatest) {
        if (WARNINGS.latestCard) {
            game.pause('<yellow>Card not found. Using latest valid card instead.</yellow>');
        }

        card = game.lodash.last(SETTINGS.card.history);
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

    SETTINGS.card.history.push(card);
    return true;
}

// eslint-disable-next-line complexity
function handleCmds(cmd: string, addToHistory = true): boolean {
    if (findCard(cmd)) {
        // You just typed the name of a card.
        return handleCmds(`${SETTINGS.commands.default} ${cmd}`);
    }

    const ARGUMENTS = cmd.split(' ');
    const NAME = ARGUMENTS.shift()?.toLowerCase();
    if (!NAME) {
        game.pause('<red>Invalid command.</red>\n');
        return false;
    }

    switch (NAME) {
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
            if (ARGUMENTS.length <= 0) {
                return false;
            }

            let heroClass = ARGUMENTS.join(' ') as CardClass;
            heroClass = game.lodash.startCase(heroClass) as CardClass;

            if (!CLASSES.includes(heroClass as CardClassNoNeutral) && heroClass !== 'Neutral') {
                game.pause('<red>Invalid class!</red>\n');
                return false;
            }

            const CORRECT_CLASS = game.functions.card.validateClasses([heroClass], chosenClass);
            if (!CORRECT_CLASS) {
                game.pause(`<yellow>Class '${heroClass}' is a different class. To see these cards, please switch class from '${chosenClass}' to '${heroClass}' to avoid confusion.</yellow>\n`);
                return false;
            }

            SETTINGS.view.class = heroClass;

            break;
        }

        case 'deckcode': {
            const DECKCODE = deckcode(true);

            let toPrint = DECKCODE.code + '\n';
            if (DECKCODE.error && !DECKCODE.error.recoverable) {
                toPrint = '';
            }

            game.pause(toPrint);

            break;
        }

        case 'sort': {
            if (ARGUMENTS.length <= 0) {
                return false;
            }

            SETTINGS.sort.type = ARGUMENTS[0] as keyof Card;
            if (ARGUMENTS.length > 1) {
                SETTINGS.sort.order = ARGUMENTS[1] as 'asc' | 'desc';
            }

            break;
        }

        case 'search': {
            if (ARGUMENTS.length <= 0) {
                SETTINGS.search.query = [];
                return false;
            }

            SETTINGS.search.query = ARGUMENTS;

            break;
        }

        case 'deck': {
            SETTINGS.view.type = SETTINGS.view.type === 'cards' ? 'deck' : 'cards';

            break;
        }

        case 'import': {
            const DECKCODE = game.input('Please input a deckcode: ');

            let DECK = game.functions.deckcode.import(player1, DECKCODE);
            if (!DECK) {
                return false;
            }

            CONFIG.decks.validate = false;
            DECK = DECK.sort((a, b) => a.name.localeCompare(b.name));
            CONFIG.decks.validate = true;

            deck = [];

            // Update the filtered cards
            chosenClass = player1.heroClass as CardClassNoNeutral;
            runes = player1.runes;
            showCards();

            // Add the cards using handleCmds instead of add because for some reason, adding them with add
            // causes a weird bug that makes modifying the deck impossible because removing a card
            // removes a completly unrelated card because javascript.
            // You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.
            for (const CARD of DECK) {
                handleCmds(`add ${CARD.displayName}`);
            }

            break;
        }

        case 'class': {
            const RUNES = runes;
            const NEW_CLASS = askClass();

            if (NEW_CLASS === chosenClass && runes === RUNES) {
                game.pause('<yellow>Your class was not changed</yellow>\n');
                return false;
            }

            deck = [];
            chosenClass = NEW_CLASS;
            if (SETTINGS.view.class !== 'Neutral') {
                SETTINGS.view.class = chosenClass;
            }

            break;
        }

        case 'undo': {
            if (SETTINGS.commands.undoableHistory.length <= 0) {
                game.pause('<red>Nothing to undo.</red>\n');
                return false;
            }

            const COMMAND_SPLIT = game.lodash.last(SETTINGS.commands.undoableHistory)?.split(' ');
            if (!COMMAND_SPLIT) {
                game.pause('<red>Could not find anything to undo. This is a bug.</red>\n');
                return false;
            }

            const ARGUMENTS = COMMAND_SPLIT.slice(1);
            const COMMAND = COMMAND_SPLIT[0];

            let reverse;

            if (COMMAND.startsWith('a')) {
                reverse = 'remove';
            } else if (COMMAND.startsWith('r')) {
                reverse = 'add';
            } else {
                // This shouldn't ever happen, but oh well
                game.log(`<red>Command '${COMMAND}' cannot be undoed.</red>`);
                return false;
            }

            handleCmds(`${reverse} ` + ARGUMENTS.join(' '), false);

            SETTINGS.commands.undoableHistory.pop();
            SETTINGS.commands.history.pop();

            break;
        }

        default: { if (NAME === 'set' && ARGUMENTS[0] === 'warning') {
            // Shift since the first element is "warning"
            ARGUMENTS.shift();
            const KEY = ARGUMENTS[0];

            if (!Object.keys(WARNINGS).includes(KEY)) {
                game.pause(`<red>'${KEY}' is not a valid warning!</red>\n`);
                return false;
            }

            let newState;

            if (ARGUMENTS.length <= 1) {
                // Toggle
                newState = !WARNINGS[KEY];
            } else {
                const VALUE = ARGUMENTS[1];

                if (['off', 'disable', 'false', 'no', '0'].includes(VALUE)) {
                    newState = false;
                } else if (['on', 'enable', 'true', 'yes', '1'].includes(VALUE)) {
                    newState = true;
                } else {
                    game.pause(`<red>${VALUE} is not a valid state. View 'help' for more information.</red>\n`);
                    return false;
                }
            }

            if (WARNINGS[KEY] === newState) {
                const NEW_STATE_NAME = newState ? 'enabled' : 'disabled';

                game.pause(`<yellow>Warning '<bright:yellow>${KEY}</bright:yellow>' is already ${NEW_STATE_NAME}.</yellow>\n`);
                return false;
            }

            WARNINGS[KEY] = newState;

            const NEW_STATE_NAME = (newState) ? '<bright:green>Enabled warning</bright:green>' : '<red>Disabled warning</red>';
            game.pause(`${NEW_STATE_NAME} <yellow>'${KEY}'</yellow>\n`);
        } else if (NAME === 'set') {
            if (ARGUMENTS.length <= 0) {
                game.log('<yellow>Too few arguments</yellow>');
                game.pause();
                return false;
            }

            const SETTING = ARGUMENTS.shift();

            switch (SETTING) {
                case 'format': {
                    if (ARGUMENTS.length === 0) {
                        SETTINGS.deckcode.format = DEFAULT_SETTINGS.deckcode.format;
                        game.log(`Reset deckcode format to: <yellow>${DEFAULT_SETTINGS.deckcode.format}</yellow>`);
                        break;
                    }

                    if (!['vanilla', 'js'].includes(ARGUMENTS[0])) {
                        game.log('<red>Invalid format!</red>');
                        game.pause();
                        return false;
                    }

                    SETTINGS.deckcode.format = ARGUMENTS[0] as 'vanilla' | 'js';
                    game.log(`Set deckcode format to: <yellow>${ARGUMENTS[0]}</yellow>`);
                    break;
                }

                case 'cpp':
                case 'cardsPerPage': {
                    if (ARGUMENTS.length === 0) {
                        SETTINGS.view.cpp = DEFAULT_SETTINGS.view.cpp;
                        game.log(`Reset cards per page to: <yellow>${DEFAULT_SETTINGS.view.cpp}</yellow>`);
                        break;
                    }

                    SETTINGS.view.cpp = game.lodash.parseInt(ARGUMENTS[0]);
                    break;
                }

                case 'dcmd':
                case 'defaultCommand': {
                    if (ARGUMENTS.length === 0) {
                        SETTINGS.commands.default = DEFAULT_SETTINGS.commands.default;
                        game.log(`Set default command to: <yellow>${DEFAULT_SETTINGS.commands.default}</yellow>`);
                        break;
                    }

                    if (!['add', 'remove', 'view'].includes(ARGUMENTS[0])) {
                        return false;
                    }

                    const COMMAND = ARGUMENTS[0];

                    SETTINGS.commands.default = COMMAND;
                    game.log(`Set default command to: <yellow>${COMMAND}</yellow>`);
                    break;
                }

                default: {
                    game.pause(`<red>'${SETTING}' is not a valid setting.</red>\n`);
                    return false;
                }
            }

            game.pause('<bright:green>Setting successfully changed!<bright:green>\n');
        } else if (NAME === 'help') {
            help();
        } else if (game.interact.shouldExit(NAME)) {
            running = false;
        } else if (NAME.startsWith('a')) {
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
        } else if (NAME.startsWith('r')) {
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
            let page = game.lodash.parseInt(ARGUMENTS.join(' '));
            if (!page) {
                return false;
            }

            if (page < 1) {
                page = 1;
            }

            SETTINGS.view.page = page;
        } else {
            // Infer add
            const TRY_COMMAND = `${SETTINGS.commands.default} ${cmd}`;
            game.log(`<yellow>Unable to find command. Trying '${TRY_COMMAND}'</yellow>`);
            return handleCmds(TRY_COMMAND);
        }
        }
    }

    if (!addToHistory) {
        return true;
    }

    SETTINGS.commands.history.push(cmd);
    if (['a', 'r'].includes(cmd[0])) {
        SETTINGS.commands.undoableHistory.push(cmd);
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
        if (SETTINGS.view.type === 'cards') {
            showCards();
        } else if (SETTINGS.view.type === 'deck') {
            showDeck();
        }

        handleCmds(game.input('\n> '));
    }
}

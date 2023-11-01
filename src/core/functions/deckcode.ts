// To decode vanilla deckcodes
import deckstrings from 'deckstrings';
import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type GameConfig, type CardClass, type CardClassNoNeutral, type CardLike, type FunctionsExportDeckError } from '@Game/types.js';
import { Card, type Player } from '../../internal.js';

export const DECKCODE_FUNCTIONS = {
    /**
     * Imports a deck using a code and put the cards into the player's deck
     *
     * @param plr The player to put the cards into the deck of
     * @param code The deck code
     *
     * @returns The deck
     */
    // eslint-disable-next-line complexity
    import(plr: Player, code: string): Card[] | undefined {
        const panic = (errorCode: string, cardName?: string) => {
            game.log(`<red>This deck is not valid!\nError Code: <yellow>${errorCode}</yellow red>`);
            if (cardName) {
                game.log(`<red>Specific Card that caused this error: <yellow>${cardName}</yellow red>`);
            }

            game.pause();
        };

        let vanilla = false;

        try {
            // If this doesn't crash, this is a vanilla deckcode
            deckstrings.decode(code);

            vanilla = true;
        } catch {
            // This isn't a vanilla code, no worries, just parse it as a hearthstone.js deckcode.
        }

        // We don't convert the code in the try-catch block, since this function could throw an error which would be ignored
        if (vanilla) {
            code = this.fromVanilla(plr, code);
        }

        // BFU
        const RUNE_REGEX = /\[[BFU]{3}]/;

        // BBB -> 3B
        const RUNE_REGEX_ALTERNATIVE = /\[3[BFU]]/;

        const RUNES_EXISTS = RUNE_REGEX.test(code) || RUNE_REGEX_ALTERNATIVE.test(code);

        let sep = ' /';

        if (RUNES_EXISTS) {
            sep = ' [';
        }

        let hero = code.split(sep)[0];

        hero = hero.trim();
        code = sep[1] + code.split(sep)[1];

        if (!game.functions.card.getClasses().includes(hero as CardClassNoNeutral)) {
            panic('INVALIDHERO');
            return;
        }

        plr.heroClass = hero as CardClass;

        // TODO: Make this less hardcoded
        const RUNE_CLASSES = ['Death Knight'];
        const RUNE_CLASS = RUNE_CLASSES.includes(hero);

        const addRunes = (runes: string) => {
            if (RUNE_CLASS) {
                plr.runes = runes;
            } else {
                game.pause(`<yellow>WARNING: This deck has runes in it, but the class is <bright:yellow>${hero}</bright:yellow>. Supported classes: <bright:yellow>${RUNE_CLASSES.join(', ')}</bright:yellow yellow>\n`);
            }
        };

        // Runes
        if (RUNE_REGEX_ALTERNATIVE.test(code)) {
            // [3B]
            const RUNE = code[2];

            code = code.slice(5);
            addRunes(RUNE.repeat(3));
        } else if (RUNE_REGEX.test(code)) {
            // [BFU]
            let runes = '';

            for (let i = 1; i <= 3; i++) {
                runes += code[i];
            }

            code = code.slice(6);
            addRunes(runes);
        } else if (RUNE_CLASS) {
            game.pause(`<yellow>WARNING: This class supports runes but there are no runes in this deck. This deck's class: <bright:yellow>${hero}</bright:yellow>. Supported classes: <bright:yellow>${RUNE_CLASSES.join(', ')}</bright:yellow yellow>\n`);
        }

        // Find /3:5,2:8,1/
        const COPY_DEFINITION_FORMAT = /\/(\d+:\d+,)*\d+\/ /;
        if (!COPY_DEFINITION_FORMAT.test(code)) {
            panic('COPYDEFNOTFOUND');
            return;
        }

        const COPY_DEFINITION = code.split('/')[1];

        code = code.replace(COPY_DEFINITION_FORMAT, '');

        const DECK = code.split(',');
        let NEW_DECK: Card[] = [];

        const LOCAL_SETTINGS = JSON.parse(JSON.stringify(game.config)) as GameConfig;

        let processed = 0;
        let returnValueInvalid = false;

        for (const COPY_DEFINITION_SPLIT_OBJECT of COPY_DEFINITION.split(',')) {
            const DEFINITION = COPY_DEFINITION_SPLIT_OBJECT.split(':');

            const COPIES = DEFINITION[0];
            const TIMES = Number.isNaN(game.lodash.parseInt(DEFINITION[1])) ? DECK.length : game.lodash.parseInt(DEFINITION[1]);

            const CARDS = DECK.slice(processed, TIMES);

            for (const CARD_ID of CARDS) {
                const ID = game.lodash.parseInt(CARD_ID, 36);

                const BLUEPRINT = game.functions.card.getFromId(ID);
                if (!BLUEPRINT) {
                    panic('NONEXISTANTCARD', ID.toString());
                    returnValueInvalid = true;
                    continue;
                }

                const CARD = new Card(BLUEPRINT.name, plr);

                for (let i = 0; i < game.lodash.parseInt(COPIES); i++) {
                    NEW_DECK.push(CARD.perfectCopy());
                }

                if (CARD.deckSettings) {
                    for (const SETTING of Object.entries(CARD.deckSettings)) {
                        const [KEY, VALUE] = SETTING;

                        // HACK: Never usage
                        LOCAL_SETTINGS[KEY as keyof GameConfig] = VALUE as never;
                    }
                }

                const ERROR = CARD.validateForDeck();

                if (!LOCAL_SETTINGS.decks.validate || ERROR === true) {
                    continue;
                }

                let error;

                switch (ERROR) {
                    case 'class': {
                        error = 'You have a card from a different class in your deck';
                        break;
                    }

                    case 'uncollectible': {
                        error = 'You have an uncollectible card in your deck';
                        break;
                    }

                    case 'runes': {
                        error = 'A card does not support your current runes';
                        break;
                    }

                    default: {
                        throw new Error('Unknown error code when validating a card in a deck');
                    }
                }

                game.pause(`<red>${error}.\nSpecific Card that caused the error: <yellow>${CARD.name}</yellow red>\n`);
                returnValueInvalid = true;
            }

            if (returnValueInvalid) {
                continue;
            }

            processed += TIMES;
        }

        if (returnValueInvalid) {
            return undefined;
        }

        const MAX = LOCAL_SETTINGS.decks.maxLength;
        const MIN = LOCAL_SETTINGS.decks.minLength;

        if ((NEW_DECK.length < MIN || NEW_DECK.length > MAX) && LOCAL_SETTINGS.decks.validate) {
            const GRAMMAR = (MIN === MAX) ? `exactly <yellow>${MAX}</yellow>` : `between <yellow>${MIN}-${MAX}</yellow>`;
            game.pause(`<red>The deck needs ${GRAMMAR} cards. Your deck has: <yellow>${NEW_DECK.length}</yellow>.\n`);
            return undefined;
        }

        // Check if you have more than 2 cards or more than 1 legendary in your deck. (The numbers can be changed in the config)
        const CARDS: Record<string, number> = {};
        for (const CARD of NEW_DECK) {
            if (!CARDS[CARD.name]) {
                CARDS[CARD.name] = 0;
            }

            CARDS[CARD.name]++;
        }

        for (const CARD_OBJECT of Object.entries(CARDS)) {
            const AMOUNT = CARD_OBJECT[1];
            const CARD_NAME = CARD_OBJECT[0];

            let errorcode;
            if (AMOUNT > LOCAL_SETTINGS.decks.maxOfOneCard) {
                errorcode = 'normal';
            }

            if (game.functions.card.getFromName(CARD_NAME)?.rarity === 'Legendary' && AMOUNT > LOCAL_SETTINGS.decks.maxOfOneLegendary) {
                errorcode = 'legendary';
            }

            if (!LOCAL_SETTINGS.decks.validate || !errorcode) {
                continue;
            }

            let error;
            switch (errorcode) {
                case 'normal': {
                    error = `<red>There are more than <yellow>${LOCAL_SETTINGS.decks.maxOfOneCard}</yellow> of a card in your deck.</red>`;
                    break;
                }

                case 'legendary': {
                    error = `<red>There are more than <yellow>${LOCAL_SETTINGS.decks.maxOfOneLegendary}</yellow> of a legendary card in your deck.</red>`;
                    break;
                }

                default: {
                    error = '';
                    break;
                }
            }

            throw new Error(error + `\n<red>Specific card that caused this error: <yellow>${CARD_NAME}</yellow>. Amount: <yellow>${AMOUNT}</yellow>.\n`);
        }

        NEW_DECK = game.lodash.shuffle(NEW_DECK);

        plr.deck = NEW_DECK;

        return NEW_DECK;
    },

    /**
     * Generates a deckcode from a list of blueprints
     *
     * @param deck The deck to create a deckcode from
     * @param heroClass The class of the deck. Example: "Priest"
     * @param runes The runes of the deck. Example: "BFU"
     *
     * @returns The deckcode, An error message alongside any additional information.
     */
    export(deck: CardLike[], heroClass: string, runes: string): { code: string; error: FunctionsExportDeckError } {
        let error: FunctionsExportDeckError;

        if (deck.length < game.config.decks.minLength) {
            error = { msg: 'TooFewCards', info: { amount: deck.length }, recoverable: true };
        }

        if (deck.length > game.config.decks.maxLength) {
            error = { msg: 'TooManyCards', info: { amount: deck.length }, recoverable: true };
        }

        if (deck.length <= 0) {
            // Unrecoverable error
            error = { msg: 'EmptyDeck', info: undefined, recoverable: false };

            return { code: '', error };
        }

        let deckcode = `${heroClass} `;

        if (runes) {
            // If the runes is 3 of one type, write, for example, 3B instead of BBB
            deckcode += new Set(...runes).size === 1 ? `[3${runes[0]}] ` : `[${runes}] `;
        }

        deckcode += '/';

        let cards: Array<[CardLike, number]> = [];

        for (const CARD of deck) {
            const FOUND = cards.find(a => a[0].name === CARD.name);

            if (FOUND) {
                cards[cards.indexOf(FOUND)][1]++;
            } else {
                cards.push([CARD, 1]);
            }
        }

        // Sort
        cards = cards.sort((a, b) => a[1] - b[1]);

        let lastCopy = 0;
        for (const CARD_OBJECT of cards) {
            const [CARD, COPIES] = CARD_OBJECT;

            if (COPIES === lastCopy) {
                continue;
            }

            let amount = 0;
            let last = false;

            for (const [INDEX, CARD_OBJECT] of cards.entries()) {
                if (CARD_OBJECT[1] !== COPIES) {
                    continue;
                }

                if ((INDEX + 1) === cards.length) {
                    last = true;
                }

                amount++;
            }

            lastCopy = COPIES;

            deckcode += last ? COPIES : `${COPIES}:${amount},`;

            if (COPIES > game.config.decks.maxOfOneLegendary && CARD.rarity === 'Legendary') {
                error = { msg: 'TooManyLegendaryCopies', info: { card: CARD, amount: COPIES }, recoverable: true };
            } else if (COPIES > game.config.decks.maxOfOneCard) {
                error = { msg: 'TooManyCopies', info: { card: CARD, amount: COPIES }, recoverable: true };
            }
        }

        deckcode += '/ ';

        deckcode += cards.map(c => c[0].id.toString(36)).join(',');

        return { code: deckcode, error };
    },

    /**
     * Turns a Hearthstone.js deckcode into a vanilla deckcode
     *
     * @param plr The player that will get the deckcode
     * @param code The deckcode
     * @param extraFiltering If it should do extra filtering when there are more than 1 possible card. This may choose the wrong card.
     *
     * @returns The vanilla deckcode
     */
    toVanilla(plr: Player, code: string, extraFiltering = true): string {
        // HACK: Jank code ahead. Beware!
        //
        // Reference: Death Knight [3B] /1:4,2/ 3f,5f,6f...

        const DECK: deckstrings.DeckDefinition = { cards: [], heroes: [], format: 1 };

        // List of vanilla heroes dbfIds
        const VANILLA_HEROES: { [key in CardClass]?: number } = {
            Warrior: 7,
            Hunter: 31,
            Druid: 274,
            Mage: 637,
            Paladin: 671,
            Priest: 813,
            Warlock: 893,
            Rogue: 930,
            Shaman: 1066,
            'Demon Hunter': 56_550,
            'Death Knight': 78_065,
        };

        const CODE_SPLIT = code.split(/[[/]/);
        const HERO_CLASS = CODE_SPLIT[0].trim();

        const HERO_CLASS_ID = VANILLA_HEROES[HERO_CLASS as CardClass];
        if (!HERO_CLASS_ID) {
            throw new Error(`Invalid hero class: ${HERO_CLASS}`);
        }

        DECK.heroes.push(HERO_CLASS_ID);

        // Remove the class
        CODE_SPLIT.splice(0, 1);

        // Remove runes
        if (CODE_SPLIT[0].endsWith('] ')) {
            CODE_SPLIT.splice(0, 1);
        }

        const AMOUNT_STRING = CODE_SPLIT[0].trim();
        const CARDS = CODE_SPLIT[1].trim();

        // Now it's just the cards left
        const VANILLA_CARDS = game.functions.card.vanilla.getAll();

        const CARDS_SPLIT = CARDS.split(',').map(i => game.lodash.parseInt(i, 36));
        const CARDS_SPLIT_ID = CARDS_SPLIT.map(i => game.functions.card.getFromId(i));
        const CARDS_SPLIT_CARD = CARDS_SPLIT_ID.map(c => {
            if (!c) {
                throw new Error('c is an invalid card');
            }

            return new Card(c.name, plr);
        });
        const TRUE_CARDS = CARDS_SPLIT_CARD.map(c => c.displayName);

        // Cards is now a list of names
        const NEW_CARDS: Array<[number, number]> = [];

        for (const [INDEX, CARD_NAME] of TRUE_CARDS.entries()) {
            let amount = 1;

            // Find how many copies to put in the deck
            const AMOUNT_STRING_SPLIT = AMOUNT_STRING.split(':');

            let found = false;
            for (const [INDEX_2, AMOUNT] of AMOUNT_STRING_SPLIT.entries()) {
                if (found) {
                    continue;
                }

                // We only want to look at every other one
                if (INDEX_2 % 2 === 0) {
                    continue;
                }

                if (INDEX >= game.lodash.parseInt(AMOUNT)) {
                    continue;
                }

                // This is correct
                found = true;

                amount = game.lodash.parseInt(AMOUNT_STRING_SPLIT[AMOUNT_STRING_SPLIT.indexOf(AMOUNT) - 1]);
            }

            if (!found) {
                const CHARACTER = AMOUNT_STRING.at(-1);
                amount = game.lodash.parseInt(CHARACTER ?? '0');
            }

            let matches = VANILLA_CARDS.filter(a => a.name.toLowerCase() === CARD_NAME.toLowerCase());
            matches = game.functions.card.vanilla.filter(matches, true, extraFiltering);

            if (matches.length === 0) {
                // Invalid card
                game.pause('<red>ERROR: Invalid card found!</red>\n');
                continue;
            }

            let match: VanillaCard;

            if (matches.length > 1) {
                // Ask the user to pick one
                for (const [INDEX, VANILLA_CARD] of matches.entries()) {
                    delete VANILLA_CARD.elite;

                    // All cards here should already be collectible
                    delete VANILLA_CARD.collectible;
                    delete VANILLA_CARD.artist;
                    delete VANILLA_CARD.mechanics;

                    // Just look at `m.races`
                    delete VANILLA_CARD.race;
                    delete VANILLA_CARD.referencesTags;

                    game.log(`${INDEX + 1}: `);
                    game.log(VANILLA_CARD);
                }

                game.log(`<yellow>Multiple cards with the name '</yellow>${CARD_NAME}<yellow>' detected! Please choose one:</yellow>`);
                const CHOSEN = game.input();

                match = matches[game.lodash.parseInt(CHOSEN) - 1];
            } else {
                match = matches[0];
            }

            NEW_CARDS.push([match.dbfId, amount]);
        }

        DECK.cards = NEW_CARDS;

        const ENCODED_DECK = deckstrings.encode(DECK);
        return ENCODED_DECK;
    },

    /**
     * Turns a vanilla deckcode into a Hearthstone.js deckcode
     *
     * @param plr The player that will get the deckcode
     * @param code The deckcode
     *
     * @returns The Hearthstone.js deckcode
     */
    // eslint-disable-next-line complexity
    fromVanilla(plr: Player, code: string): string {
        // Use the 'deckstrings' library's decode
        const DECK_WITH_FORMAT: deckstrings.DeckDefinition = deckstrings.decode(code);

        const VANILLA_CARDS = game.functions.card.vanilla.getAll();

        // We don't care about the format
        const { format: FORMAT, ...DECK } = DECK_WITH_FORMAT;

        const HERO_CLASS = VANILLA_CARDS.find(a => a.dbfId === DECK.heroes[0])?.cardClass;
        let heroClass = game.lodash.capitalize(HERO_CLASS?.toString() ?? game.player2.heroClass);

        // Wtf hearthstone?
        if (heroClass === 'Deathknight') {
            heroClass = 'Death Knight';
        }

        if (heroClass === 'Demonhunter') {
            heroClass = 'Demon Hunter';
        }

        // Get the full card object from the dbfId
        const DECK_DEFINITION: Array<[VanillaCard | undefined, number]> = DECK.cards.map(c => [VANILLA_CARDS.find(a => a.dbfId === c[0]), c[1]]);
        const CREATED_CARDS: Card[] = game.functions.card.getAll(false);

        const INVALID_CARDS: VanillaCard[] = [];
        for (const VANILLA_CARD_OBJECT of DECK_DEFINITION) {
            const VANILLA_CARD = VANILLA_CARD_OBJECT[0];
            if (!VANILLA_CARD || typeof VANILLA_CARD === 'number') {
                continue;
            }

            if (CREATED_CARDS.some(card => card.name === VANILLA_CARD.name || card.displayName === VANILLA_CARD.name)) {
                continue;
            }

            if (INVALID_CARDS.includes(VANILLA_CARD)) {
                continue;
            }

            // The card doesn't exist.
            game.logError(`<red>ERROR: Card <yellow>${VANILLA_CARD.name} <bright:yellow>(${VANILLA_CARD.dbfId})</yellow bright:yellow> doesn't exist!</red>`);
            INVALID_CARDS.push(VANILLA_CARD);
        }

        if (INVALID_CARDS.length > 0) {
            // There was a card in the deck that isn't implemented in Hearthstone.js
            // Add a newline
            game.logError();
            throw new Error('Some cards do not currently exist. You cannot play on this deck without them.');
        }

        let newDeck: Array<[Card, number]> = [];

        // All cards in the deck exists
        const AMOUNTS: Record<number, number> = {};
        for (const VANILLA_CARD_OBJECT of DECK_DEFINITION) {
            const [VANILLA_CARD, amount] = VANILLA_CARD_OBJECT;
            if (!VANILLA_CARD || typeof VANILLA_CARD === 'number') {
                continue;
            }

            let name = VANILLA_CARDS.find(a => a.dbfId === VANILLA_CARD.dbfId)?.name;
            // The name can still not be correct
            if (!CREATED_CARDS.some(a => a.name === name)) {
                name = CREATED_CARDS.find(a => (a.displayName ?? '') === name)?.name;
            }

            if (!name) {
                throw new Error('Could not get name from card in deckdefinition');
            }

            newDeck.push([new Card(name, plr), amount]);

            if (!AMOUNTS[amount]) {
                AMOUNTS[amount] = 0;
            }

            AMOUNTS[amount]++;
        }

        // Sort the `newDeck` array, lowest amount first
        newDeck = newDeck.sort((a, b) => a[1] - b[1]);

        // Assemble Hearthstone.js deckcode.
        let deckcode = `${heroClass} `;

        // Generate runes
        let runes = '';

        if (heroClass === 'Death Knight') {
            for (const CARD_AMOUNT_OBJECT of newDeck) {
                const CARD = CARD_AMOUNT_OBJECT[0];

                if (!CARD.runes) {
                    continue;
                }

                runes += CARD.runes;
            }

            let sortedRunes = '';

            if (runes.includes('B')) {
                sortedRunes += 'B';
            }

            if (runes.includes('F')) {
                sortedRunes += 'F';
            }

            if (runes.includes('U')) {
                sortedRunes += 'U';
            }

            runes = runes.replace('B', '');
            runes = runes.replace('F', '');
            runes = runes.replace('U', '');

            sortedRunes += runes;

            // Only use the first 3 characters
            runes = sortedRunes.slice(0, 3);

            if (runes === '') {
                runes = '3B';
            }

            if (runes.startsWith(runes[1]) && runes[1] === runes[2]) {
                runes = `3${runes[0]}`;
            }

            deckcode += `[${runes}] `;
        }

        deckcode += '/';

        // Amount format
        for (const ENTRY of Object.entries(AMOUNTS)) {
            const [KEY, AMOUNT] = ENTRY;

            // If this is the last amount
            deckcode += AMOUNTS[game.lodash.parseInt(KEY) + 1] ? `${KEY}:${AMOUNT},` : KEY;
        }

        deckcode += '/ ';

        deckcode += newDeck.map(c => c[0].id.toString(36)).join(',');

        return deckcode;
    },
};

// To decode vanilla deckcodes
import deckstrings from 'deckstrings';
import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type CardClass, type CardClassNoNeutral, type CardLike, type FunctionsExportDeckError } from '@Game/types.js';
import { Card, type Player } from '../../internal.js';

export const deckcodeFunctions = {
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
        /**
         * Cause the function to return an error
         */
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

        if (vanilla) {
            code = deckcodeFunctions.fromVanilla(plr, code);
        }

        // BFU
        const runeRegex = /\[[BFU]{3}]/;

        // BBB -> 3B
        const altRuneRegex = /\[3[BFU]]/;

        const runesExists = runeRegex.test(code) || altRuneRegex.test(code);

        let sep = ' /';

        if (runesExists) {
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

        const runeClasses = ['Death Knight'];
        const runeClass = runeClasses.includes(hero);

        const addRunes = (runes: string) => {
            if (runeClass) {
                plr.runes = runes;
            } else {
                game.pause(`<yellow>WARNING: This deck has runes in it, but the class is <bright:yellow>${hero}</bright:yellow>. Supported classes: <bright:yellow>${runeClasses.join(', ')}</bright:yellow yellow>\n`);
            }
        };

        // Runes
        if (altRuneRegex.test(code)) {
            // [3B]
            const rune = code[2];

            code = code.slice(5);
            addRunes(rune.repeat(3));
        } else if (runeRegex.test(code)) {
            // [BFU]
            let runes = '';

            for (let i = 1; i <= 3; i++) {
                runes += code[i];
            }

            code = code.slice(6);
            addRunes(runes);
        } else if (runeClass) {
            game.pause(`<yellow>WARNING: This class supports runes but there are no runes in this deck. This deck's class: <bright:yellow>${hero}</bright:yellow>. Supported classes: <bright:yellow>${runeClasses.join(', ')}</bright:yellow yellow>\n`);
        }

        // Find /3:5,2:8,1/
        const copyDefFormat = /\/(\d+:\d+,)*\d+\/ /;
        if (!copyDefFormat.test(code)) {
            panic('COPYDEFNOTFOUND');
            return;
        }

        const copyDef = code.split('/')[1];

        code = code.replace(copyDefFormat, '');

        const deck = code.split(',');
        let _deck: Card[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const localSettings = JSON.parse(JSON.stringify(game.config));

        let processed = 0;
        let returnValueInvalid = false;

        for (const c of copyDef.split(',')) {
            const def = c.split(':');

            const copies = def[0];
            let times = game.lodash.parseInt(def[1]);
            if (Number.isNaN(times)) {
                times = deck.length;
            }

            const cards = deck.slice(processed, times);

            for (const c of cards) {
                const id = game.lodash.parseInt(c, 36);

                const bp = game.functions.card.getFromId(id);
                if (!bp) {
                    panic('NONEXISTANTCARD', id.toString());
                    returnValueInvalid = true;
                    continue;
                }

                const card = new Card(bp.name, plr);

                for (let i = 0; i < game.lodash.parseInt(copies); i++) {
                    _deck.push(card.perfectCopy());
                }

                if (card.deckSettings) {
                    for (const setting of Object.entries(card.deckSettings)) {
                        const [key, value] = setting;

                        localSettings[key] = value;
                    }
                }

                const validateTest = card.validateForDeck();

                if (!localSettings.validateDecks || validateTest === true) {
                    continue;
                }

                let error;

                switch (validateTest) {
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
                        error = '';
                        break;
                    }
                }

                game.pause(`<red>${error}.\nSpecific Card that caused the error: <yellow>${card.name}</yellow red>\n`);
                returnValueInvalid = true;
            }

            if (returnValueInvalid) {
                continue;
            }

            processed += times;
        }

        if (returnValueInvalid) {
            return undefined;
        }

        const max = localSettings.maxDeckLength as number;
        const min = localSettings.minDeckLength as number;

        if ((_deck.length < min || _deck.length > max) && localSettings.validateDecks) {
            const grammar = (min === max) ? `exactly <yellow>${max}</yellow>` : `between <yellow>${min}-${max}</yellow>`;
            game.pause(`<red>The deck needs ${grammar} cards. Your deck has: <yellow>${_deck.length}</yellow>.\n`);
            return undefined;
        }

        // Check if you have more than 2 cards or more than 1 legendary in your deck. (The numbers can be changed in the config)
        const cards: Record<string, number> = {};
        for (const c of _deck) {
            if (!cards[c.name]) {
                cards[c.name] = 0;
            }

            cards[c.name]++;
        }

        for (const v of Object.entries(cards)) {
            const amount = v[1];
            const cardName = v[0];

            let errorcode;
            if (amount > localSettings.maxOfOneCard) {
                errorcode = 'normal';
            }

            if (game.functions.card.getFromName(cardName)?.rarity === 'Legendary' && amount > localSettings.maxOfOneLegendary) {
                errorcode = 'legendary';
            }

            if (!localSettings.validateDecks || !errorcode) {
                continue;
            }

            let error;
            switch (errorcode) {
                case 'normal': {
                    error = `<red>There are more than <yellow>${localSettings.maxOfOneCard}</yellow> of a card in your deck.</red>`;
                    break;
                }

                case 'legendary': {
                    error = `<red>There are more than <yellow>${localSettings.maxOfOneLegendary}</yellow> of a legendary card in your deck.</red>`;
                    break;
                }

                default: {
                    error = '';
                    break;
                }
            }

            throw new Error(error + `\n<red>Specific card that caused this error: <yellow>${cardName}</yellow>. Amount: <yellow>${amount}</yellow>.\n`);
        }

        _deck = game.lodash.shuffle(_deck);

        plr.deck = _deck;

        return _deck;
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

        for (const c of deck) {
            const found = cards.find(a => a[0].name === c.name);

            if (found) {
                cards[cards.indexOf(found)][1]++;
            } else {
                cards.push([c, 1]);
            }
        }

        // Sort
        cards = cards.sort((a, b) => a[1] - b[1]);

        let lastCopy = 0;
        for (const c of cards) {
            const [card, copies] = c;

            if (copies === lastCopy) {
                continue;
            }

            let amount = 0;
            let last = false;

            for (const [i, c] of cards.entries()) {
                if (c[1] !== copies) {
                    continue;
                }

                if ((i + 1) === cards.length) {
                    last = true;
                }

                amount++;
            }

            lastCopy = copies;

            deckcode += last ? copies : `${copies}:${amount},`;

            if (copies > game.config.decks.maxOfOneLegendary && card.rarity === 'Legendary') {
                error = { msg: 'TooManyLegendaryCopies', info: { card, amount: copies }, recoverable: true };
            } else if (copies > game.config.decks.maxOfOneCard) {
                error = { msg: 'TooManyCopies', info: { card, amount: copies }, recoverable: true };
            }
        }

        deckcode += '/ ';

        deckcode += cards.map(c => c[0].id?.toString(36)).join(',');

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

        const deck: deckstrings.DeckDefinition = { cards: [], heroes: [], format: 1 };

        // List of vanilla heroes dbfIds
        const vanillaHeroes: { [key in CardClass]?: number } = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Warrior: 7,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Hunter: 31,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Druid: 274,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Mage: 637,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Paladin: 671,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Priest: 813,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Warlock: 893,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Rogue: 930,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Shaman: 1066,
            'Demon Hunter': 56_550,
            'Death Knight': 78_065,
        };

        const codeSplit = code.split(/[[/]/);
        const heroClass = codeSplit[0].trim();

        const heroClassId = vanillaHeroes[heroClass as CardClass];
        if (!heroClassId) {
            throw new Error(`Invalid hero class: ${heroClass}`);
        }

        deck.heroes.push(heroClassId);

        // Remove the class
        codeSplit.splice(0, 1);

        // Remove runes
        if (codeSplit[0].endsWith('] ')) {
            codeSplit.splice(0, 1);
        }

        const amountString = codeSplit[0].trim();
        const cards = codeSplit[1].trim();

        // Now it's just the cards left
        const vanillaCards = game.functions.card.vanilla.getAll();

        const cardsSplit = cards.split(',').map(i => game.lodash.parseInt(i, 36));
        const cardsSplitId = cardsSplit.map(i => game.functions.card.getFromId(i));
        const cardsSplitCard = cardsSplitId.map(c => {
            if (!c) {
                throw new Error('c is an invalid card');
            }

            return new Card(c.name, plr);
        });
        const trueCards = cardsSplitCard.map(c => c.displayName);

        // Cards is now a list of names
        const newCards: Array<[number, number]> = [];

        for (const [i, c] of trueCards.entries()) {
            let amount = 1;

            // Find how many copies to put in the deck
            const amountStringSplit = amountString.split(':');

            let found = false;
            for (const [i2, a] of amountStringSplit.entries()) {
                if (found) {
                    continue;
                }

                // We only want to look at every other one
                if (i2 % 2 === 0) {
                    continue;
                }

                if (i >= game.lodash.parseInt(a)) {
                    continue;
                }

                // This is correct
                found = true;

                amount = game.lodash.parseInt(amountStringSplit[amountStringSplit.indexOf(a) - 1]);
            }

            if (!found) {
                const char = amountString.at(-1);
                amount = game.lodash.parseInt(char ?? '0');
            }

            let matches = vanillaCards.filter(a => a.name.toLowerCase() === c.toLowerCase());
            matches = game.functions.card.vanilla.filter(matches, true, extraFiltering);

            if (matches.length === 0) {
                // Invalid card
                game.pause('<red>ERROR: Invalid card found!</red>\n');
                continue;
            }

            let match: VanillaCard;

            if (matches.length > 1) {
                // Ask the user to pick one
                for (const [i, m] of matches.entries()) {
                    delete m.elite;

                    // All cards here should already be collectible
                    delete m.collectible;
                    delete m.artist;
                    delete m.mechanics;

                    // Just look at `m.races`
                    delete m.race;
                    delete m.referencesTags;

                    game.log(`${i + 1}: `);
                    game.log(m);
                }

                game.log(`<yellow>Multiple cards with the name '</yellow>${c}<yellow>' detected! Please choose one:</yellow>`);
                const chosen = game.input();

                match = matches[game.lodash.parseInt(chosen) - 1];
            } else {
                match = matches[0];
            }

            newCards.push([match.dbfId, amount]);
        }

        deck.cards = newCards;

        const encodedDeck = deckstrings.encode(deck);
        return encodedDeck;
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
        const deckWithFormat: deckstrings.DeckDefinition = deckstrings.decode(code);

        const vanillaCards = game.functions.card.vanilla.getAll();

        // We don't care about the format
        const { format, ...deck } = deckWithFormat;

        const _heroClass = vanillaCards.find(a => a.dbfId === deck.heroes[0])?.cardClass;
        let heroClass = game.lodash.capitalize(_heroClass?.toString() ?? game.player2.heroClass);

        // Wtf hearthstone?
        if (heroClass === 'Deathknight') {
            heroClass = 'Death Knight';
        }

        if (heroClass === 'Demonhunter') {
            heroClass = 'Demon Hunter';
        }

        // Get the full card object from the dbfId
        const deckDef: Array<[VanillaCard | undefined, number]> = deck.cards.map(c => [vanillaCards.find(a => a.dbfId === c[0]), c[1]]);
        const createdCards: Card[] = game.functions.card.getAll(false);

        const invalidCards: VanillaCard[] = [];
        for (const c of deckDef) {
            const vanillaCard = c[0];
            if (!vanillaCard || typeof vanillaCard === 'number') {
                continue;
            }

            if (createdCards.some(card => card.name === vanillaCard.name || card.displayName === vanillaCard.name)) {
                continue;
            }

            if (invalidCards.includes(vanillaCard)) {
                continue;
            }

            // The card doesn't exist.
            game.logError(`<red>ERROR: Card <yellow>${vanillaCard.name} <bright:yellow>(${vanillaCard.dbfId})</yellow bright:yellow> doesn't exist!</red>`);
            invalidCards.push(vanillaCard);
        }

        if (invalidCards.length > 0) {
            // There was a card in the deck that isn't implemented in Hearthstone.js
            // Add a newline
            game.logError();
            throw new Error('Some cards do not currently exist. You cannot play on this deck without them.');
        }

        let newDeck: Array<[Card, number]> = [];

        // All cards in the deck exists
        const amounts: Record<number, number> = {};
        for (const c of deckDef) {
            const [vanillaCard, amount] = c;
            if (!vanillaCard || typeof vanillaCard === 'number') {
                continue;
            }

            let name = vanillaCards.find(a => a.dbfId === vanillaCard.dbfId)?.name;
            // The name can still not be correct
            if (!createdCards.some(a => a.name === name)) {
                name = createdCards.find(a => (a.displayName ?? '') === name)?.name;
            }

            if (!name) {
                throw new Error('Could not get name from card in deckdefinition');
            }

            newDeck.push([new Card(name, plr), amount]);

            if (!amounts[amount]) {
                amounts[amount] = 0;
            }

            amounts[amount]++;
        }

        // Sort the `newDeck` array, lowest amount first
        newDeck = newDeck.sort((a, b) => a[1] - b[1]);

        // Assemble Hearthstone.js deckcode.
        let deckcode = `${heroClass} `;

        // Generate runes
        let runes = '';

        if (heroClass === 'Death Knight') {
            for (const c of newDeck) {
                const card = c[0];

                if (!card.runes) {
                    continue;
                }

                runes += card.runes;
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
        for (const a of Object.entries(amounts)) {
            const [key, amount] = a;

            // If this is the last amount
            deckcode += amounts[game.lodash.parseInt(key) + 1] ? `${key}:${amount},` : key;
        }

        deckcode += '/ ';

        deckcode += newDeck.map(c => c[0].id.toString(36)).join(',');

        return deckcode;
    },
};

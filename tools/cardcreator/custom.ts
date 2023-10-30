
/**
 * This is the custom card creator.
 * @module Custom Card Creator
 */

import rl from 'readline-sync';
import { createGame } from '../../src/internal.js';
import { type Blueprint, type BlueprintWithOptional, type CardClass, type CardKeyword, type CardRarity, type CardType, type MinionTribe, type SpellSchool } from '../../src/types.js';
import * as lib from './lib.js';

const { game } = createGame();

let shouldExit = false;
let type: CardType;

function input(prompt: string) {
    if (shouldExit) {
        return '';
    }

    const RETURN_VALUE = game.input(prompt);

    if (game.interact.shouldExit(RETURN_VALUE)) {
        shouldExit = true;
    }

    return RETURN_VALUE;
}

function applyCard(_card: BlueprintWithOptional) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const NEW_CARD = {} as Blueprint;

    for (const ENTRY of Object.entries(_card)) {
        let [KEY, VALUE] = ENTRY;

        // These are the required fields and their default values.
        const DEFAULTS = {
            name: 'CHANGE THIS',
            text: '',
            cost: 0,
            classes: ['Neutral'],
            rarity: 'Free',
            stats: [1, 1],
            tribe: 'None',
            spellSchool: 'None',
            hpText: 'CHANGE THIS',
            hpCost: 2,
            durability: 2,
            cooldown: 2,
        };

        let valueUndefined = !VALUE;

        // If the value is an array, the value is undefined if every element is falsy
        valueUndefined ||= Array.isArray(VALUE) && VALUE.every(v => !v);

        // The value should not be undefined if it is 0
        valueUndefined &&= VALUE !== 0;

        // Don't include the key if the value is falsy, unless the key is required.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const DEFAULT_VALUE = game.lodash.get(DEFAULTS, KEY);
        if (DEFAULT_VALUE !== undefined && valueUndefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            VALUE = DEFAULT_VALUE;
            valueUndefined = false;
        }

        if (valueUndefined) {
            continue;
        }

        // HACK: Well, it is not ts-expect-error at least
        NEW_CARD[KEY as keyof Blueprint] = VALUE as never;
    }

    return NEW_CARD;
}

function common(): BlueprintWithOptional {
    const NAME = input('Name: ');
    const DISPLAY_NAME = input('Display Name: ');
    const TEXT = input('Text: ');
    const COST = game.lodash.parseInt(input('Cost: '));
    const CLASSES = input('Classes: ') as CardClass;
    const RARITY = input('Rarity: ') as CardRarity;
    const KEYWORDS = input('Keywords: ');

    let runes;
    if (CLASSES === 'Death Knight') {
        runes = input('Runes: ');
    }

    let realKeywords: CardKeyword[] | undefined;
    if (KEYWORDS) {
        realKeywords = KEYWORDS.split(', ') as CardKeyword[];
    }

    return {
        name: NAME,
        displayName: DISPLAY_NAME,
        text: TEXT,
        cost: COST,
        type,
        classes: [CLASSES],
        rarity: RARITY,
        id: 0,
        runes,
        keywords: realKeywords,
    };
}

const CARD_TYPE_FUNCTIONS: { [x in CardType]: () => Blueprint } = {
    Minion() {
        const CARD = common();

        const STATS = input('Stats: ');
        const TRIBE = input('Tribe: ') as MinionTribe;

        // Turn 1/1 to [1, 1]
        const STATS_ARRAY = STATS.split('/').map(s => game.lodash.parseInt(s));

        return applyCard({
            name: CARD.name,
            displayName: CARD.displayName,
            stats: STATS_ARRAY,
            text: CARD.text,
            cost: CARD.cost,
            type: CARD.type,
            tribe: TRIBE,
            classes: CARD.classes,
            rarity: CARD.rarity,
            runes: CARD.runes,
            keywords: CARD.keywords,
            id: 0,
        });
    },

    Spell() {
        const CARD = common();

        const SPELL_SCHOOL = input('Spell School: ') as SpellSchool;

        return applyCard({
            name: CARD.name,
            displayName: CARD.displayName,
            text: CARD.text,
            cost: CARD.cost,
            type: CARD.type,
            spellSchool: SPELL_SCHOOL,
            classes: CARD.classes,
            rarity: CARD.rarity,
            runes: CARD.runes,
            keywords: CARD.keywords,
            id: 0,
        });
    },

    Weapon() {
        const CARD = common();

        const STATS = input('Stats: ');

        // Turn 1/1 to [1, 1]
        const STATS_ARRAY = STATS.split('/').map(s => game.lodash.parseInt(s));

        return applyCard({
            name: CARD.name,
            displayName: CARD.displayName,
            stats: STATS_ARRAY,
            text: CARD.text,
            cost: CARD.cost,
            type: CARD.type,
            classes: CARD.classes,
            rarity: CARD.rarity,
            runes: CARD.runes,
            keywords: CARD.keywords,
            id: 0,
        });
    },

    Hero() {
        const CARD = common();

        const HP_TEXT = input('Hero Power Description: ');
        const HP_COST = game.lodash.parseInt(input('Hero Power Cost (Default: 2): ')) ?? 2;

        return applyCard({
            name: CARD.name,
            displayName: CARD.displayName,
            text: CARD.text,
            cost: CARD.cost,
            type: CARD.type,
            hpText: HP_TEXT,
            hpCost: HP_COST,
            classes: CARD.classes,
            rarity: CARD.rarity,
            runes: CARD.runes,
            keywords: CARD.keywords,
            id: 0,
        });
    },

    Location() {
        const CARD = common();

        const DURABILITY = game.lodash.parseInt(input('Durability (How many times you can trigger this location before it is destroyed): '));
        const COOLDOWN = game.lodash.parseInt(input('Cooldown (Default: 2): ')) ?? 2;

        return applyCard({
            name: CARD.name,
            displayName: CARD.displayName,
            text: CARD.text,
            cost: CARD.cost,
            type: CARD.type,
            durability: DURABILITY,
            cooldown: COOLDOWN,
            classes: CARD.classes,
            rarity: CARD.rarity,
            runes: CARD.runes,
            keywords: CARD.keywords,
            id: 0,
        });
    },

    Undefined() {
        throw new TypeError('Undefined type');
    },
};

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 *
 * @returns The path to the file
 */
export function main(debug = false, overrideType?: lib.CcType) {
    // Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
    shouldExit = false;

    game.log('Hearthstone.js Custom Card Creator (C) 2022\n');
    game.log('type \'back\' at any step to cancel.\n');

    // Ask the user for the type of card they want to make
    type = game.lodash.startCase(input('Type: ')) as CardType;
    if (shouldExit) {
        return false;
    }

    if (!Object.keys(CARD_TYPE_FUNCTIONS).includes(type)) {
        game.log('That is not a valid type!');
        game.pause();
        return false;
    }

    // HACK: Use of never
    const cardFunction: () => Blueprint = CARD_TYPE_FUNCTIONS[type as never];
    const CARD = cardFunction();

    if (shouldExit) {
        return false;
    }

    // Ask the user if the card should be uncollectible
    const UNCOLLECTIBLE = rl.keyInYN('Uncollectible?');
    if (UNCOLLECTIBLE) {
        CARD.uncollectible = UNCOLLECTIBLE as boolean;
    }

    // Actually create the card
    game.log('Creating file...');

    let cctype: lib.CcType = 'Custom';
    if (overrideType) {
        cctype = overrideType;
    }

    const FILE_PATH = lib.create(cctype, type, CARD, undefined, undefined, debug);

    game.pause();
    return FILE_PATH;
}

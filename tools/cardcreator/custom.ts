
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

    const returnValue = game.input(prompt);

    if (game.interact.shouldExit(returnValue)) {
        shouldExit = true;
    }

    return returnValue;
}

function applyCard(_card: BlueprintWithOptional) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const newCard = {} as Blueprint;

    for (const entry of Object.entries(_card)) {
        let [key, value] = entry;

        // These are the required fields and their default values.
        const defaults = {
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

        let valueUndefined = !value;

        // If the value is an array, the value is undefined if every element is falsy
        valueUndefined ||= Array.isArray(value) && value.every(v => !v);

        // The value should not be undefined if it is 0
        valueUndefined &&= value !== 0;

        // Don't include the key if the value is falsy, unless the key is required.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const defaultValue = game.lodash.get(defaults, key);
        if (defaultValue !== undefined && valueUndefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value = defaultValue;
            valueUndefined = false;
        }

        if (valueUndefined) {
            continue;
        }

        // HACK: Well, it is not ts-expect-error at least
        newCard[key as keyof Blueprint] = value as never;
    }

    return newCard;
}

function common(): BlueprintWithOptional {
    const name = input('Name: ');
    const displayName = input('Display Name: ');
    const text = input('Text: ');
    const cost = game.lodash.parseInt(input('Cost: '));
    const classes = input('Classes: ') as CardClass;
    const rarity = input('Rarity: ') as CardRarity;
    const keywords = input('Keywords: ');

    let runes;
    if (classes === 'Death Knight') {
        runes = input('Runes: ');
    }

    let realKeywords: CardKeyword[] | undefined;
    if (keywords) {
        realKeywords = keywords.split(', ') as CardKeyword[];
    }

    return {
        name,
        displayName,
        text,
        cost,
        type,
        classes: [classes],
        rarity,
        id: 0,
        runes,
        keywords: realKeywords,
    };
}

const cardTypeFunctions: { [x in CardType]: () => Blueprint } = {
    Minion() {
        const card = common();

        const stats = input('Stats: ');
        const tribe = input('Tribe: ') as MinionTribe;

        // Turn 1/1 to [1, 1]
        const statsArray = stats.split('/').map(s => game.lodash.parseInt(s));

        return applyCard({
            name: card.name,
            displayName: card.displayName,
            stats: statsArray,
            text: card.text,
            cost: card.cost,
            type: card.type,
            tribe,
            classes: card.classes,
            rarity: card.rarity,
            runes: card.runes,
            keywords: card.keywords,
            id: 0,
        });
    },

    Spell() {
        const card = common();

        const spellSchool = input('Spell School: ') as SpellSchool;

        return applyCard({
            name: card.name,
            displayName: card.displayName,
            text: card.text,
            cost: card.cost,
            type: card.type,
            spellSchool,
            classes: card.classes,
            rarity: card.rarity,
            runes: card.runes,
            keywords: card.keywords,
            id: 0,
        });
    },

    Weapon() {
        const card = common();

        const stats = input('Stats: ');

        // Turn 1/1 to [1, 1]
        const statsArray = stats.split('/').map(s => game.lodash.parseInt(s));

        return applyCard({
            name: card.name,
            displayName: card.displayName,
            stats: statsArray,
            text: card.text,
            cost: card.cost,
            type: card.type,
            classes: card.classes,
            rarity: card.rarity,
            runes: card.runes,
            keywords: card.keywords,
            id: 0,
        });
    },

    Hero() {
        const card = common();

        const hpText = input('Hero Power Description: ');
        const hpCost = game.lodash.parseInt(input('Hero Power Cost (Default: 2): ')) ?? 2;

        return applyCard({
            name: card.name,
            displayName: card.displayName,
            text: card.text,
            cost: card.cost,
            type: card.type,
            hpText,
            hpCost,
            classes: card.classes,
            rarity: card.rarity,
            runes: card.runes,
            keywords: card.keywords,
            id: 0,
        });
    },

    Location() {
        const card = common();

        const durability = game.lodash.parseInt(input('Durability (How many times you can trigger this location before it is destroyed): '));
        const cooldown = game.lodash.parseInt(input('Cooldown (Default: 2): ')) ?? 2;

        return applyCard({
            name: card.name,
            displayName: card.displayName,
            text: card.text,
            cost: card.cost,
            type: card.type,
            durability,
            cooldown,
            classes: card.classes,
            rarity: card.rarity,
            runes: card.runes,
            keywords: card.keywords,
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

    if (!Object.keys(cardTypeFunctions).includes(type)) {
        game.log('That is not a valid type!');
        game.pause();
        return false;
    }

    // HACK: Use of never
    const cardFunction: () => Blueprint = cardTypeFunctions[type as never];
    const card = cardFunction();

    if (shouldExit) {
        return false;
    }

    // Ask the user if the card should be uncollectible
    const uncollectible = rl.keyInYN('Uncollectible?');
    if (uncollectible) {
        card.uncollectible = uncollectible as boolean;
    }

    // Actually create the card
    game.log('Creating file...');

    let cctype: lib.CcType = 'Custom';
    if (overrideType) {
        cctype = overrideType;
    }

    const filePath = lib.create(cctype, type, card, undefined, undefined, debug);

    game.pause();
    return filePath;
}

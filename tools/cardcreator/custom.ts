/**
 * This is the custom card creator.
 * @module Custom Card Creator
 */

import rl from "readline-sync";
import * as lib from "./lib.js";
import { createGame } from "../../src/internal.js";
import { Blueprint, BlueprintWithOptional, CardClass, CardKeyword, CardRarity, CardType, MinionTribe, SpellSchool } from "../../src/types.js";

const { game, player1, player2 } = createGame();

let shouldExit = false;
let type: CardType;

function input(prompt: string) {
    if (shouldExit) return "";
    const ret = game.input(prompt);

    if (game.interact.shouldExit(ret)) shouldExit = true;
    return ret;
}

function applyCard(_card: BlueprintWithOptional) {
    const newCard = {} as Blueprint;

    Object.entries(_card).forEach(c => {
        let [key, val] = c;

        // These are the required fields and their default values.
        const defaults = {
            name: "CHANGE THIS",
            text: "",
            cost: 0,
            classes: ["Neutral"],
            rarity: "Free",
            stats: [1, 1],
            tribe: "None",
            spellSchool: "None",
            hpText: "CHANGE THIS",
            hpCost: 2,
            durability: 2,
            cooldown: 2,
        };

        let valUndefined = !val;

        // If the value is an array, the value is undefined if every element is falsy
        valUndefined ||= val instanceof Array && val.every(v => !v);

        // The value should not be undefined if it is 0
        valUndefined &&= val !== 0;

        // Don't include the key if the value is falsy, unless the key is required.
        const defaultVal = game.lodash.get(defaults, key, undefined);
        if (defaultVal !== undefined && valUndefined) {
            val = defaultVal;
            valUndefined = false;
        }

        if (valUndefined) return;

        // HACK: Well, it is not ts-expect-error at least
        newCard[key as keyof Blueprint] = val as never;
    });

    return newCard;
}

function common(): BlueprintWithOptional {
    const name = input("Name: ");
    const displayName = input("Display Name: ");
    const text = input("Text: ");
    const cost = parseInt(input("Cost: "));
    const classes = input("Classes: ") as CardClass;
    const rarity = input("Rarity: ") as CardRarity;
    const keywords = input("Keywords: ");

    let runes;
    if (classes == "Death Knight") runes = input("Runes: ");

    let realKeywords: CardKeyword[] | undefined;
    if (keywords) realKeywords = keywords.split(', ') as CardKeyword[];

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

const cardTypeFunctions = {
    Minion() {
        const _card = common();

        const stats = input("Stats: ");
        const tribe = input("Tribe: ") as MinionTribe;

        // Turn 1/1 to [1, 1]
        const statsArray = stats.split("/").map(s => parseInt(s));

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            stats: statsArray,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            tribe,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },

    Spell() {
        const _card = common();

        const spellSchool = input("Spell School: ") as SpellSchool;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            spellSchool: spellSchool,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },

    Weapon() {
        const _card = common();

        const stats = input("Stats: ");

        // Turn 1/1 to [1, 1]
        const statsArray = stats.split("/").map(s => parseInt(s));

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            stats: statsArray,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });

    },

    Hero() {
        const _card = common();

        const hpText = input("Hero Power Description: ");
        let hpCost = parseInt(input("Hero Power Cost (Default: 2): ")) ?? 2;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            hpText,
            hpCost,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },

    Location() {
        const _card = common();
        
        const durability = parseInt(input("Durability (How many times you can trigger this location before it is destroyed): "));
        let cooldown = parseInt(input("Cooldown (Default: 2): ")) ?? 2;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            durability,
            cooldown,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },

    Example() {
        // Copy-and-pasted from Minion
        const _card = common();

        const stats = input("Stats: ");
        const example = parseInt(input("Example: "));

        // Turn 1/1 to [1, 1]
        const statsArray = stats.split("/").map(s => parseInt(s));

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            stats: statsArray,
            text: _card.text,
            cost: _card.cost,
            type: _card.type,
            example,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },
}

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 * 
 * @returns The path to the file
 */
export function main(debug = false, overrideType?: lib.CCType) {
    // Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
    shouldExit = false;

    game.log("Hearthstone.js Custom Card Creator (C) 2022\n");
    game.log("type 'back' at any step to cancel.\n");

    // Ask the user for the type of card they want to make
    type = game.functions.util.capitalizeAll(input("Type: ")) as CardType;
    if (shouldExit) return false;

    if (!Object.keys(cardTypeFunctions).includes(type)) {
        game.log("That is not a valid type!");
        game.pause();
        return false;
    }

    // HACK: Use of never
    const cardFunction: Function = cardTypeFunctions[type as never];
    let card = cardFunction();

    if (shouldExit) return false;

    // Ask the user if the card should be uncollectible
    const uncollectible = rl.keyInYN("Uncollectible?");
    if (uncollectible) card.uncollectible = uncollectible as boolean;

    // Actually create the card
    game.log("Creating file...");

    let cctype: lib.CCType = "Custom";
    if (overrideType) cctype = overrideType;

    const filePath = lib.create(cctype, type, card, undefined, undefined, debug);

    game.pause();
    return filePath;
}

/**
 * This is the custom card creator.
 * @module Custom Card Creator
 */

import rl from "readline-sync";
import * as lib from "./lib.js";
import { createGame } from "../../src/internal.js";
import { Blueprint, CardClass, CardKeyword, CardRarity, CardType, MinionTribe, SpellSchool } from "../../src/types.js";

const { game, player1, player2 } = createGame();
let card: Blueprint;

let shouldExit = false;
let type: CardType;

function input(prompt: string) {
    const ret = game.input(prompt);

    if (game.interact.shouldExit(ret)) shouldExit = true;
    return ret;
}

function applyCard(_card: Blueprint) {
    let newCard: Blueprint;

    Object.entries(_card).forEach(c => {
        let [key, val] = c;

        let required_keys = ["name", "desc", "cost", "class", "rarity", "stats", "durability", "hpDesc", "hpCost", "cooldown"];
        if (!val && val !== 0 && !required_keys.includes(key)) return;

        // HACK: Well, it is not ts-expect-error at least
        newCard[key as keyof Blueprint] = val as never;
    });

    return newCard!;
}

function common(): false | Blueprint {
    const name = input("Name: ");
    if (shouldExit) return false;

    const displayName = input("Display Name: ");
    if (shouldExit) return false;

    const description = input("Description: ");
    if (shouldExit) return false;

    const cost = input("Mana Cost: ");
    if (shouldExit) return false;

    const classes = input("Classes: ") as CardClass;
    if (shouldExit) return false;

    const rarity = input("Rarity: ") as CardRarity;
    if (shouldExit) return false;

    let keywords = input("Keywords: ");
    if (shouldExit) return false;
    
    let runes;
    if (classes == "Death Knight") runes = input("Runes: ");
    if (shouldExit) return false;

    let realKeywords: CardKeyword[] | undefined;
    if (keywords) realKeywords = keywords.split(', ') as CardKeyword[];

    return {
        name: name,
        displayName: displayName,
        desc: description,
        cost: parseInt(cost),
        type: type,
        classes: [classes],
        rarity: rarity,
        runes: runes,
        keywords: realKeywords,
        id: 0,
    };
}

const cardTypeFunctions = {
    Minion() {
        let _card = common();
        if (!_card) return false;

        let stats = input("Stats: ");
        if (shouldExit) return false;

        const tribe = input("Tribe: ");
        if (shouldExit) return false;

        // Turn 1/1 to [1, 1]
        let statsArray = stats.split("/").map(s => parseInt(s));

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            stats: statsArray,
            desc: _card.desc,
            cost: _card.cost,
            type: _card.type,
            tribe: tribe as MinionTribe,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            id: 0,
        });
    },

    Spell() {
        let _card = common();
        if (!_card) return false;

        const spellSchool = input("Spell School: ") as SpellSchool;
        if (shouldExit) return false;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            desc: _card.desc,
            cost: _card.cost,
            type: _card.type,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            spellSchool: spellSchool,
            id: 0,
        });
    },

    Weapon() {
        let _card = common();
        if (!_card) return false;

        let stats = input("Stats: ");
        if (shouldExit) return false;

        // Turn 1/1 to [1, 1]
        let statsArray = stats.split("/").map(s => parseInt(s));

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            stats: statsArray,
            desc: _card.desc,
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
        let _card = common();
        if (!_card) return false;

        const hpDesc = input("Hero Power Description: ");
        if (shouldExit) return false;

        let hpCost = parseInt(input("Hero Power Cost (Default: 2): "));
        if (shouldExit) return false;

        if (!hpCost) hpCost = 2;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            desc: _card.desc,
            cost: _card.cost,
            type: _card.type,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            hpDesc: hpDesc,
            hpCost: hpCost,
            id: 0,
        });
    },

    Location() {
        let _card = common();
        if (!_card) return false;
        
        let durability = parseInt(input("Durability (How many times you can trigger this location before it is destroyed): "));
        if (shouldExit) return false;

        let cooldown = parseInt(input("Cooldown (Default: 2): "));
        if (shouldExit) return false;

        if (!cooldown) cooldown = 2;

        return applyCard({
            name: _card.name,
            displayName: _card.displayName,
            desc: _card.desc,
            cost: _card.cost,
            type: _card.type,
            classes: _card.classes,
            rarity: _card.rarity,
            runes: _card.runes,
            keywords: _card.keywords,
            durability: durability,
            cooldown: cooldown,
            id: 0,
        });
    }
}

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 * 
 * @returns The path to the file
 */
export function main(debug = false, overrideType?: lib.CCType) {
    // Reset the card
    card = {} as Blueprint;

    // Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
    shouldExit = false;
    game.log("Hearthstone.js Custom Card Creator (C) 2022\n");
    game.log("type 'back' at any step to cancel.\n");

    // Ask the user for the type of card they want to make
    type = game.functions.capitalizeAll(input("Type: ")) as CardType;
    if (shouldExit) return false;

    if (!Object.keys(cardTypeFunctions).includes(type)) {
        game.log("That is not a valid type!");
        game.input();
        return false;
    }

    // HACK: Use of never
    let cardFunction: Function = cardTypeFunctions[type as never];
    let tmpCard: Blueprint | false = cardFunction();
    
    if (!tmpCard) return false;
    card = tmpCard;

    if (shouldExit) return false;

    // Ask the user if the card should be uncollectible
    let uncollectible = rl.keyInYN("Uncollectible?");
    if (uncollectible) card.uncollectible = uncollectible as boolean;

    // Actually create the card
    game.log("Creating file...");

    let cctype: lib.CCType = "Custom";
    if (overrideType) cctype = overrideType;

    let filePath = lib.create(cctype, type, card, undefined, undefined, debug);

    game.input();
    return filePath;
}

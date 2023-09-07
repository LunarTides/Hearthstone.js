/**
 * This is the custom card creator.
 * @module Custom Card Creator
 */

import rl from "readline-sync";
import * as lib from "../lib.js";
import { createGame } from "../../src/internal.js";
import { Blueprint, CardClass, CardKeyword, CardRarity, CardType, MinionTribe, SpellSchool } from "../../src/types.js";

const { game, player1, player2 } = createGame();
let card: Blueprint;

let shouldExit = false;
let type: CardType;

function input(prompt: string) {
    const ret = rl.question(prompt);

    if (["exit", "stop", "quit", "back"].includes(ret.toLowerCase())) shouldExit = true;
    return ret;
}

function applyCard(_card: Blueprint) {
    // @ts-expect-error
    let newCard: Blueprint = {};

    Object.entries(_card).forEach(c => {
        let [key, val] = c;

        let required_keys = ["name", "desc", "mana", "class", "rarity", "stats", "hpDesc", "hpCost", "cooldown"];
        if (!val && val !== 0 && !required_keys.includes(key)) return;

        // @ts-expect-error
        newCard[key] = val;
    });

    return newCard;
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
        mana: parseInt(cost),
        type: type,
        classes: [classes],
        rarity: rarity,
        runes: runes,
        keywords: realKeywords,
        id: 0,
    };
}

function minion() {
    let _card = common();
    if (!_card) return false;

    let stats = input("Stats: ");
    if (shouldExit) return false;

    const tribe = input("Tribe: ");
    if (shouldExit) return false;

    return applyCard({
        name: _card.name,
        displayName: _card.displayName,
        stats: stats.split("/").map(s => parseInt(s)),
        desc: _card.desc,
        mana: _card.mana,
        type: _card.type,
        tribe: tribe as MinionTribe,
        classes: _card.classes,
        rarity: _card.rarity,
        runes: _card.runes,
        keywords: _card.keywords,
        id: 0,
    });
}

function spell() {
    let _card = common();
    if (!_card) return false;

    const spellSchool = input("Spell School: ") as SpellSchool;
    if (shouldExit) return false;

    let combined: Blueprint = Object.assign(_card, { "spellSchool": spellSchool });

    return applyCard(combined);
}

function weapon() {
    let _card = common();
    if (!_card) return false;

    let stats = input("Stats: ");
    if (shouldExit) return false;

    return applyCard({
        name: _card.name,
        displayName: _card.displayName,
        stats: stats.split("/").map(s => parseInt(s)),
        desc: _card.desc,
        mana: _card.mana,
        type: _card.type,
        classes: _card.classes,
        rarity: _card.rarity,
        runes: _card.runes,
        keywords: _card.keywords,
        id: 0,
    });
}

function hero() {
    let _card = common();
    if (!_card) return false;

    const hpDesc = input("Hero Power Description: ");
    if (shouldExit) return false;

    let hpCost = parseInt(input("Hero Power Cost (Default: 2): "));
    if (shouldExit) return false;

    if (!hpCost) hpCost = 2;

    let combined = Object.assign(_card, {
        hpDesc,
        hpCost
    });

    return applyCard(combined);
}

function location() {
    let _card = common();
    if (!_card) return false;
    
    let durability = parseInt(input("Durability (How many times you can trigger this location before it is destroyed): "));
    if (shouldExit) return false;

    let cooldown = parseInt(input("Cooldown (Default: 2): "));
    if (shouldExit) return false;

    if (!cooldown) cooldown = 2;
    let stats = [0, durability];

    return applyCard({
        name: _card.name,
        displayName: _card.displayName,
        stats: stats,
        desc: _card.desc,
        mana: _card.mana,
        type: _card.type,
        classes: _card.classes,
        rarity: _card.rarity,
        runes: _card.runes,
        keywords: _card.keywords,
        cooldown: cooldown,
        id: 0,
    });
}

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 * 
 * @returns The path to the file
 */
export function main() {
    // Reset the card
    // @ts-expect-error
    card = {};

    // Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
    shouldExit = false;
    console.log("Hearthstone.js Custom Card Creator (C) 2022\n");
    console.log("type 'back' at any step to cancel.\n");

    // Ask the user for the type of card they want to make
    type = input("Type: ") as CardType;
    if (shouldExit) return false;

    let tmpCard;

    switch (type) {
        case "Minion":
            tmpCard = minion();
            break;
        case "Weapon":
            tmpCard = weapon();
            break;
        case "Spell":
            tmpCard = spell();
            break;
        case "Location":
            tmpCard = location();
            break;
        case "Hero":
            tmpCard = hero();
            break
        default:
            console.log("That is not a valid type!");
            rl.question();
            return false;
    }
    
    if (typeof tmpCard === "boolean") return false;
    card = tmpCard;

    if (shouldExit) return false;

    // Ask the user if the card should be uncollectible
    let uncollectible = rl.keyInYN("Uncollectible?");
    if (uncollectible) card.uncollectible = uncollectible as boolean;

    // Actually create the card
    console.log("Creating file...");

    let filePath = lib.create("Custom", type, card);

    game.input();
    return filePath;
}

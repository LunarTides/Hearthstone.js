/**
 * This is the vanilla card creator.
 * @module Vanilla Card Creator
 */

import { Blueprint, CardClass, CardRarity, MinionTribe, SpellSchool, VanillaCard } from "../../src/types.js";
import { createGame } from "../../src/internal.js";

import fs from "fs";
import chalk from "chalk";
import rl from "readline-sync";
import * as lib from "../lib.js";

const { game, player1, player2 } = createGame();

/**
 * Create a card from a vanilla card.
 * 
 * @param card The vanilla card
 * @param debug If it should use debug mode
 */
export function create(card: VanillaCard, debug: boolean) {
    // Harvest info
    let cardClass = game.functions.capitalize(card.cardClass ?? "Neutral") as CardClass;
    let collectible = card.collectible ?? false;
    let mana = card.cost;
    let name = card.name;
    let rarity = "Free" as CardRarity;
    if (card.rarity) rarity = game.functions.capitalize(card.rarity) as CardRarity;
    let desc = card.text ?? "";
    let type = game.functions.capitalize(card.type);

    // Minion info
    let attack = card.attack ?? -1;
    let health = card.health ?? -1;
    let races: MinionTribe[] = [];
    if (card.races) races = card.races.map(r => game.functions.capitalize(r) as MinionTribe);

    // Spell info
    let spellSchool: SpellSchool | undefined = card.spellSchool ? game.functions.capitalize(card.spellSchool) as SpellSchool : undefined;

    // Weapon Info
    let durability = card.durability ?? -1;

    // Modify the desc
    desc = desc.replaceAll("\n", " ");
    desc = desc.replaceAll("<b>", "&B");
    desc = desc.replaceAll("</b>", "&R");
    desc = desc.replaceAll("[x]", "");

    const classes = game.functions.getClasses() as CardClass[];
    classes.push("Neutral");

    while (!classes.includes(cardClass)) {
        cardClass = game.functions.capitalizeAll(game.input(chalk.red("Was not able to find the class of this card.\nWhat is the class of this card? "))) as CardClass;
    }

    let realName = rl.question("Override name (this will set 'name' to be the displayname instead) (leave empty to not use display name): ") || name;

    let blueprint: Blueprint;

    if (type == "Minion") {
        blueprint = {
            name: realName,
            stats: [attack, health],
            desc,
            mana,
            type,
            tribe: races[0] || "None", // TODO: Add support for more than 1 tribe
            classes: [cardClass],
            rarity,
            id: 0,
        }
    }
    else if (type == "Spell") {
        blueprint = {
            name: realName,
            desc,
            mana,
            type,
            spellSchool,
            classes: [cardClass],
            rarity,
            id: 0,
        }
    }
    else if (type == "Weapon") {
        blueprint = {
            name: realName,
            stats: [attack, durability],
            desc,
            mana,
            type,
            classes: [cardClass],
            rarity,
            id: 0,
        }
    }
    else if (type == "Hero") {
        blueprint = {
            name: realName,
            desc,
            mana,
            type,
            classes: [cardClass],
            rarity,
            hpDesc: "",
            hpCost: 2,
            id: 0,
        }
    }
    else if (type == "Location") {
        blueprint = {
            name: realName,
            stats: [0, health],
            desc,
            mana,
            type,
            classes: [cardClass],
            rarity,
            cooldown: 2,
            id: 0,
        }
    }
    else {
        console.log(`${type} is not a valid type!`);
        process.exit(1);
    }

    if (!collectible) blueprint.uncollectible = true;

    if (realName != name) {
        blueprint.displayName = name;
    }

    lib.create("Vanilla", type, blueprint, undefined, undefined, debug);
}

/**
 * Prompt the user to pick a card, then create it.
 * 
 * @returns If a card was created
 */
export function main() {
    console.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

    const fileLocation = game.functions.dirname() + "../cardcreator/vanilla/.ignore.cards.json";

    if (!fs.existsSync(fileLocation)) {
        console.log("No cards file found! Run 'scripts/genvanilla.bat' (requires an internet connection), then try again.\n");
        return false;
    }

    let data = fs.readFileSync(fileLocation, "utf8");

    let parsedData: VanillaCard[] = JSON.parse(data);

    let debug = false;
    if (game.config.debug) {
        debug = !rl.keyInYN("Do you want the card to actually be created?");
    }

    while (true) {
        let cardName = rl.question("\nName / dbfId (Type 'back' to cancel): ");
        if (["exit", "quit", "close", "back"].includes(cardName.toLowerCase())) break;

        let filtered_cards = parsedData.filter(c => c.name.toLowerCase() == cardName.toLowerCase() || c.dbfId == parseInt(cardName));
        filtered_cards = game.functions.filterVanillaCards(filtered_cards, false, true);

        if (filtered_cards.length <= 0) {
            console.log("Invalid card.\n");
            continue;
        }

        let card;

        if (filtered_cards.length > 1) {
            // Prompt the user to pick one
            filtered_cards.forEach((c, i) => {
                // Get rid of useless information
                delete c["elite"];
                // @ts-expect-error
                delete c["id"];
                // @ts-expect-error
                delete c["artist"];
                // @ts-expect-error
                delete c["heroPowerDbfId"];
                // @ts-expect-error
                delete c["flavor"];
                // @ts-expect-error
                delete c["mechanics"];

                console.log(`\n${i + 1}:`);
                console.log(c);
            });

            let picked = parseInt(rl.question(`Pick one (1-${filtered_cards.length}): `));
            if (!picked || !filtered_cards[picked - 1]) {
                console.log("Invalid number.\n");
                continue;
            }

            card = filtered_cards[picked - 1];
        }
        else card = filtered_cards[0];

        console.log(`Found '${card.name}'\n`);

        create(card, debug);
    }

    return true;
}
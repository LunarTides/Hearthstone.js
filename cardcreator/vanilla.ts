/**
 * This is the vanilla card creator.
 * @module Vanilla Card Creator
 */

import { Blueprint, CardClass, CardRarity, MinionTribe, SpellSchool, VanillaCard } from "../src/types.js";
import { createGame } from "../src/internal.js";

import rl from "readline-sync";
import * as lib from "./lib.js";

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
    let cost = card.cost;
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
    let spellSchool: SpellSchool | undefined;
    if (card.spellSchool) spellSchool = game.functions.capitalize(card.spellSchool) as SpellSchool;

    // Weapon Info
    let durability = card.durability ?? -1;

    // Modify the desc
    desc = desc.replaceAll("\n", " ");
    desc = desc.replaceAll("[x]", "");

    const classes = game.functions.getClasses() as CardClass[];
    classes.push("Neutral");

    while (!classes.includes(cardClass)) {
        cardClass = game.functions.capitalizeAll(game.input("<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>")) as CardClass;
    }

    let realName = game.input("Override name (this will set 'name' to be the displayname instead) (leave empty to not use display name): ") || name;

    let blueprint: Blueprint;

    if (type == "Minion") {
        blueprint = {
            name: realName,
            stats: [attack, health],
            desc,
            cost,
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
            cost,
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
            stats: [attack, health],
            desc,
            cost,
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
            cost,
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
            desc,
            cost,
            type,
            classes: [cardClass],
            rarity,
            durability,
            cooldown: 2,
            id: 0,
        }
    }
    else {
        game.log(`${type} is not a valid type!`);
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
    game.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

    const [vanillaCards, error] = game.functions.getVanillaCards();

    if (error) {
        game.input(error);
        return false;
    };

    let debug = false;
    if (game.config.general.debug) {
        debug = !rl.keyInYN("Do you want the card to actually be created?");
    }

    while (true) {
        let cardName = game.input("\nName / dbfId (Type 'back' to cancel): ");
        if (game.interact.shouldExit(cardName)) break;

        let filtered_cards = vanillaCards.filter(c => c.name.toLowerCase() == cardName.toLowerCase() || c.dbfId == parseInt(cardName));
        filtered_cards = game.functions.filterVanillaCards(filtered_cards, false, true);

        if (filtered_cards.length <= 0) {
            game.log("Invalid card.\n");
            continue;
        }

        let card;

        if (filtered_cards.length > 1) {
            // Prompt the user to pick one
            filtered_cards.forEach((c, i) => {
                // Get rid of useless information
                delete c["elite"];
                delete c["heroPowerDbfId"];
                // @ts-expect-error
                delete c["id"];
                // @ts-expect-error
                delete c["artist"];
                // @ts-expect-error
                delete c["flavor"];
                // @ts-expect-error
                delete c["mechanics"];

                game.log(`\n${i + 1}:`);
                game.log(c);
            });

            let picked = parseInt(game.input(`Pick one (1-${filtered_cards.length}): `));
            if (!picked || !filtered_cards[picked - 1]) {
                game.log("Invalid number.\n");
                continue;
            }

            card = filtered_cards[picked - 1];
        }
        else card = filtered_cards[0];

        game.log(`Found '${card.name}'\n`);

        create(card, debug);
    }

    return true;
}

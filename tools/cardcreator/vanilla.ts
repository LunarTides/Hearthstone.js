/**
 * This is the vanilla card creator.
 * @module Vanilla Card Creator
 */

import { Blueprint, CardClass, CardRarity, MinionTribe, SpellSchool, VanillaCard } from "../../src/types.js";
import { createGame } from "../../src/internal.js";

import rl from "readline-sync";
import * as lib from "./lib.js";

const { game, player1, player2 } = createGame();

/**
 * Create a card from a vanilla card.
 * 
 * @param card The vanilla card
 * @param debug If it should use debug mode
 */
export function create(card: VanillaCard, debug: boolean, overrideType?: lib.CCType) {
    // Harvest info
    let cardClass = game.lodash.capitalize(card.cardClass ?? "Neutral") as CardClass;
    const collectible = card.collectible ?? false;
    const cost = card.cost ?? 0;
    const name = card.name;
    let rarity = "Free" as CardRarity;
    if (card.rarity) rarity = game.lodash.capitalize(card.rarity) as CardRarity;
    let text = card.text ?? "";
    const type = game.lodash.capitalize(card.type);

    // Minion info
    const attack = card.attack ?? -1;
    const health = card.health ?? -1;
    let races: MinionTribe[] = [];
    if (card.races) races = card.races.map(r => game.lodash.capitalize(r) as MinionTribe);

    // Spell info
    let spellSchool: SpellSchool | undefined;
    if (card.spellSchool) spellSchool = game.lodash.capitalize(card.spellSchool) as SpellSchool;

    // Weapon Info
    const durability = card.durability ?? -1;

    // Modify the text
    text = text.replaceAll("\n", " ");
    text = text.replaceAll("[x]", "");

    const classes = game.functions.card.getClasses() as CardClass[];
    classes.push("Neutral");

    while (!classes.includes(cardClass)) {
        cardClass = game.functions.util.capitalizeAll(game.input("<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>")) as CardClass;
    }

    const realName = game.input("Override name (this will set 'name' to be the displayname instead) (leave empty to not use display name): ") || name;

    let blueprint: Blueprint;

    if (type == "Minion") {
        blueprint = {
            name: realName,
            stats: [attack, health],
            text,
            cost,
            type,
            // TODO: Add support for more than 1 tribe. #334
            tribe: races[0] || "None",
            classes: [cardClass],
            rarity,
            id: 0,
        }
    }
    else if (type == "Spell") {
        blueprint = {
            name: realName,
            text,
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
            stats: [attack, durability],
            text,
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
            text,
            cost,
            type,
            hpText: "",
            hpCost: 2,
            classes: [cardClass],
            rarity,
            id: 0,
        }
    }
    else if (type == "Location") {
        blueprint = {
            name: realName,
            text,
            cost,
            type,
            durability: health,
            cooldown: 2,
            classes: [cardClass],
            rarity,
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

    let cctype: lib.CCType = "Vanilla";
    if (overrideType) cctype = overrideType;

    lib.create(cctype, type, blueprint, undefined, undefined, debug);
}

/**
 * Prompt the user to pick a card, then create it.
 * 
 * @returns If a card was created
 */
export function main(debug = false, overrideType?: lib.CCType) {
    game.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

    const vanillaCards = game.functions.card.vanilla.getAll();

    if (vanillaCards instanceof Error) {
        game.log(vanillaCards.stack);
        game.pause();
        return false;
    };

    if (game.config.general.debug) {
        debug = !rl.keyInYN("Do you want the card to actually be created?");
    }

    while (true) {
        const cardName = game.input("\nName / dbfId (Type 'back' to cancel): ");
        if (game.interact.shouldExit(cardName)) break;

        let filteredCards = vanillaCards.filter(c => c.name.toLowerCase() == cardName.toLowerCase() || c.dbfId == parseInt(cardName));
        filteredCards = game.functions.card.vanilla.filter(filteredCards, false, true);

        if (filteredCards.length <= 0) {
            game.log("Invalid card.\n");
            continue;
        }

        let card;

        if (filteredCards.length > 1) {
            // Prompt the user to pick one
            filteredCards.forEach((c, i) => {
                // Get rid of useless information
                delete c["elite"];
                delete c["heroPowerDbfId"];
                delete c["artist"];
                delete c["flavor"];
                delete c["mechanics"];

                const { id, ...card } = c;

                game.log(`\n${i + 1}:`);
                game.log(card);
            });

            const picked = parseInt(game.input(`Pick one (1-${filteredCards.length}): `));
            if (!picked || !filteredCards[picked - 1]) {
                game.log("Invalid number.\n");
                continue;
            }

            card = filteredCards[picked - 1];
        }
        else card = filteredCards[0];

        game.log(`Found '${card.name}'\n`);

        create(card, debug, overrideType);
    }

    return true;
}

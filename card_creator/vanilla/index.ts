import { Blueprint, CardClass, CardRarity, MinionTribe, SpellSchool, VanillaCard } from "../../src/types.js";
import { Game, Player } from "../../src/internal.js";

import fs from "fs";
import chalk from "chalk";
import rl from "readline-sync";
import * as lib from "../lib.js";

const game = new Game();
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
game.setup(player1, player2);
game.functions.importCards(game.functions.dirname() + "cards");
game.functions.importConfig(game.functions.dirname() + "config");

function createCard(card: VanillaCard, main: boolean) {
    // Harvest info
    let cardClass = game.functions.capitalize(card.cardClass ?? "Neutral") as CardClass;
    let collectible = card.collectible || false;
    let mana = card.cost;
    let name = card.name;
    let rarity = "Free" as CardRarity;
    if (card.rarity) rarity = game.functions.capitalize(card.rarity) as CardRarity;
    let desc = card.text || "";
    let type = game.functions.capitalize(card.type);

    // Minion info
    let attack = card.attack || -1;
    let health = card.health || -1;
    let races: MinionTribe[] = [];
    if (card.races) races = card.races.map(r => game.functions.capitalize(r) as MinionTribe);

    // Spell info
    let spellClass: SpellSchool | undefined = card.spellSchool ? game.functions.capitalize(card.spellSchool) as SpellSchool : undefined;

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
            desc: desc,
            mana: mana,
            type: type,
            tribe: races[0] || "None", // TODO: Add support for more than 1 tribe
            classes: [cardClass],
            rarity: rarity,
            id: 0,
        }
    }
    else if (type == "Spell") {
        blueprint = {
            name: realName,
            desc: desc,
            mana: mana,
            type: type,
            spellClass: spellClass,
            classes: [cardClass],
            rarity: rarity,
            id: 0,
        }
    }
    else if (type == "Weapon") {
        blueprint = {
            name: realName,
            stats: [attack, durability],
            desc: desc,
            mana: mana,
            type: type,
            classes: [cardClass],
            rarity: rarity,
            id: 0,
        }
    }
    else if (type == "Hero") {
        blueprint = {
            name: realName,
            desc: desc,
            mana: mana,
            type: type,
            classes: [cardClass],
            rarity: rarity,
            hpDesc: "",
            hpCost: 2,
            id: 0,
        }
    }
    else if (type == "Location") {
        blueprint = {
            name: realName,
            stats: [0, health],
            desc: desc,
            mana: mana,
            type: type,
            classes: [cardClass],
            rarity: rarity,
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

    //if (main) console.log(blueprint);

    lib.set_type("Vanilla"); // Vanilla Card Creator
    lib.create(type, blueprint);
}

export function main(card?: VanillaCard) {
    console.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

    if (card) return createCard(card, false);

    const fileLocation = game.functions.dirname() + "../card_creator/vanilla/.ignore.cards.json";

    if (!fs.existsSync(fileLocation)) {
        console.log("No cards file found! Run 'scripts/genvanilla.bat' (requires an internet connection), then try again.\n");
        return false;
    }

    let data = fs.readFileSync(fileLocation, "utf8");

    let parsedData: VanillaCard[] = JSON.parse(data);

    if (game.config.debug) {
        let debug = !rl.keyInYN("Do you want the card to actually be created?");
        lib.set_debug(debug);
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

        createCard(card, true);
    }

    return true;
}

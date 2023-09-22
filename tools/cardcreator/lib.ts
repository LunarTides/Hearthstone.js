/**
 * This is a library
 * @module Card Creator Library
 */

import fs from "fs";
import { createGame } from "../../src/internal.js";
import { Blueprint, CardClass, CardType } from "../../src/types.js";

const { game, player1, player2 } = createGame();

let card: Blueprint;
let type: CardType;

export type CCType = "Unknown" | "Class" | "Custom" | "Vanilla";

function getCardAbility(cardType: CardType) {
    // Get the card's ability
    let ability;

    // If the card is a spell, the ability is 'cast'
    if (cardType == "Spell") ability = "Cast";

    // If the card is a hero card, the ability is 'heropower'
    else if (cardType == "Hero") ability = "HeroPower";

    // If the card is a location, the ability is 'use'
    else if (cardType == "Location") ability = "Use";

    else {
        // Try to extract an ability from the card's description
        let reg = /([A-Z][a-z].*?):/g;
        let foundAbility = card.desc.match(reg);

        // If the card doesn't have a description, it doesn't get an ability.
        if (!card.desc) ability = "";

        // If it didn't find an ability, but the card has text in it's description, the ability is 'passive'
        else if (!foundAbility) ability = "Passive";

        // If it found an ability, and the card has a description, the ability is the ability it found in the description.
        else ability = foundAbility[1];
    }

    return ability;
}

function generateCardPath(...args: [CardClass[], CardType]) {
    // Create a path to put the card in.
    let [classes, type] = args;

    // DO NOT CHANGE THIS
    let static_path = game.functions.dirname() + `../cards/`;

    // You can change everything below this comment
    let classesString = classes.join("/");

    // If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
    if (card.desc.includes("Secret:")) type = "Secret" as CardType;

    // If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
    let typeString = (type == "Hero") ? "Heroe" : type;

    let collectibleString = card.uncollectible ? "Uncollectible" : "Collectible";

    // This can be anything since the card register process ignores folders.
    // Change this if you want the cards to be in different folders.
    // By default, this is `cards/Classes/{class name}/{Uncollectible | Collectible}/{type}s/{mana cost} Cost/{card name}.mts`;
    // This path can be overridden by passing `overridePath` in the create function.
    let dynamic_path = `Classes/${classesString}/${collectibleString}/${typeString}s/${card.cost} Cost/`;

    return static_path + dynamic_path;
}

/**
 * Generates a new card based on the provided arguments and saves it to a file.
 *
 * @param creatorType The type of card creator.
 * @param cardType The type of card.
 * @param blueprint The blueprint for the card.
 * @param overridePath The override path for the card.
 * @param overrideFilename The override filename for the card.
 * @param debug If true, doesn't save the card, just prints out details about it.
 * 
 * @return The path of the created file.
 */
export function create(creatorType: CCType, cardType: CardType, blueprint: Blueprint, overridePath?: string, overrideFilename?: string, debug?: boolean) {
    // If the user didn't specify a tribe, but the tribe exists, set the tribe to "None".
    type = cardType;
    card = blueprint;

    let func = getCardAbility(type);

    // Here it creates a default function signature
    let isPassive = func.toLowerCase() == "passive";
    let triggerText = ")";
    if (isPassive) triggerText = ", key, _unknownValue)";
    
    let extraPassiveCode = "";
    if (isPassive) extraPassiveCode = `
        // Only proceed if the correct event key was broadcast
        if (!(key === "")) return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const val = _unknownValue as EventValue<typeof key>;
        `;
    
    let desc_to_clean = type == "Hero" ? card.hpDesc : card.desc;
    // card.hpDesc can be undefined, but shouldn't be if the type is Hero.
    if (desc_to_clean === undefined) throw new Error("Card has no hero power description.");

    // If the desc has `<b>Battlecry:</b> Dredge.`, add `// Dredge.` to the battlecry ability
    let cleaned_desc = game.functions.stripTags(desc_to_clean).replace(`${func}: `, "");

    // Example 1: '\n\n    passive(plr, game, self, key, _unknownValue) {\n        // Your battlecries trigger twice.\n        ...\n    }',
    // Example 2: '\n\n    battlecry(plr, game, self) {\n        // Deal 2 damage to the opponent.\n        \n    }'
    if (func) func = `
    
    ${func.toLowerCase()}(plr, game, self${triggerText} {
        // ${cleaned_desc}
        ${extraPassiveCode}
    }`;

    // Create a path to put the card in.
    let path = generateCardPath(card.classes, type);

    // If this function was passed in a path, use that instead.
    if (overridePath) path = overridePath; 

    // Create a filename. Example: "Test Card" -> "test_card.mts"
    let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".mts";

    // If this function was passed in a filename, use that instead.
    if (overrideFilename) filename = overrideFilename;

    // Get the latest card-id
    let id = parseInt(fs.readFileSync(game.functions.dirname() + "../cards/.latest_id", "utf8")) + 1;
    let file_id = `\n    id: ${id},`;

    // Generate the content of the card
    // If the value is a string, put '"value"'. If it is not a string, put 'value'.
    const getTypeValue = (val: any) => {
        let ret = val;

        /**
         * Adds double quotes around the string
         */
        const stringify = (val: string) => {
            return `"${val}"`;
        }

        // If the value is an array, put "["value1", "value2"]", or "[1, 2]", or any combination of those two.
        if (val instanceof Array) ret = "[" + val.map((v: any) => {
            if (typeof v === "string") return stringify(v);
            else return v;
        }).join(", ") + "]";

        // If the value is a string, put "value"
        if (typeof val === "string") ret = stringify(val);

        // Turn the value into a string.
        return ret.toString();
    }

    // If the function is passive, add `EventValue` to the list of imports
    let passiveImport = isPassive ? ", EventValue" : "";

    // Add the key/value pairs to the content
    let contentArray = Object.entries(card).filter(c => c[0] != "id").map(c => `${c[0]}: ${getTypeValue(c[1])}`);

    // Add the content
    let content = `// Created by the ${creatorType} Card Creator

import { Blueprint${passiveImport} } from "@Game/types.js";

export const blueprint: Blueprint = {
    ${contentArray.join(',\n    ')},${file_id}${func}
}
`;

    // The path is now "./cardcreator/../cards/...", replace this with "./cards/..."
    path = path.replace(/[\/\\]dist[\/\\]\.\./, "");
    let file_path = path + filename;

    if (!debug) {
        // If debug mode is disabled, write the card to disk.
        
        // Increment the id in '.latest_id' by 1
        fs.writeFileSync(game.functions.dirname() + "../cards/.latest_id", id.toString()); 

        // If the path the card would be written to doesn't exist, create it.
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        // Write the file to the path
        fs.writeFileSync(file_path, content);

        game.log('File created at: "' + file_path + '"');
    } else {
        // If debug mode is enabled, just show some information about the card.
        // This is the id that would be written to '.latest_id'
        game.log("\nNew ID: %s", id);
        game.log("Would be path: '%s'", file_path.replaceAll("\\", "/"));
        game.log("Content:");
        game.log(content);
        game.input();
    }

    // Open the defined editor on that card if it has a function to edit, and debug mode is disabled
    if (func && !debug) {
        let success = game.functions.openWithArgs(game.config.general.editor, `"${file_path}"`);
        if (!success) game.input();
    }

    return file_path;
}

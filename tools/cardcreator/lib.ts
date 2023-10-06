/**
 * This is a library
 * @module Card Creator Library
 */

import { createGame } from "../../src/internal.js";
import { BlueprintWithOptional, CardClass, CardType } from "../../src/types.js";
import { generateCardExports } from "../../src/helper/cards.js";
import { validateBlueprint } from "../../src/helper/validator.js";

const { game, player1, player2 } = createGame();

let card: BlueprintWithOptional;
let type: CardType;

export type CCType = "Unknown" | "Class" | "Custom" | "Vanilla";

function getCardAbility(cardType: CardType) {
    // Get the card's ability
    let ability: string;

    // If the card is a spell, the ability is 'cast'
    if (cardType == "Spell") ability = "Cast";

    // If the card is a hero card, the ability is 'heropower'
    else if (cardType == "Hero") ability = "HeroPower";

    // If the card is a location, the ability is 'use'
    else if (cardType == "Location") ability = "Use";

    // If the card is an example, the ability is 'hi'
    else if (cardType == "Example") ability = "Hi";

    else {
        // Try to extract an ability from the card's description
        const reg = /([A-Z][a-z].*?):/g;
        const foundAbility = reg.exec(card.text);

        // If the card doesn't have a description, it doesn't get an ability.
        if (!card.text) ability = "";

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
    const staticPath = game.functions.file.dirname() + "/cards/";

    // You can change everything below this comment
    const classesString = classes.join("/");

    // If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
    if (card.text.includes("Secret:")) type = "Secret" as CardType;

    // If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
    const typeString = (type == "Hero") ? "Heroe" : type;

    const collectibleString = card.uncollectible ? "Uncollectible" : "Collectible";

    // This can be anything since the card register process ignores folders.
    // Change this if you want the cards to be in different folders.
    // By default, this is `cards/Classes/{class name}/{Uncollectible | Collectible}/{type}s/{mana cost} Cost/{card name}.ts`;
    // This path can be overridden by passing `overridePath` in the create function.
    const dynamicPath = `Classes/${classesString}/${collectibleString}/${typeString}s/${card.cost} Cost/`;

    return staticPath + dynamicPath;
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
export function create(creatorType: CCType, cardType: CardType, blueprint: BlueprintWithOptional, overridePath?: string, overrideFilename?: string, debug?: boolean) {
    // Validate
    const error = validateBlueprint(blueprint);
    if (error !== true) {
        game.logError(error);
        return "";
    }

    // If the user didn't specify a tribe, but the tribe exists, set the tribe to "None".
    type = cardType;
    card = blueprint;

    let ability = getCardAbility(type);

    // Here it creates a default function signature
    const isPassive = ability.toLowerCase() == "passive";
    let triggerText = ")";
    if (isPassive) triggerText = ", key, _unknownValue, eventPlayer)";
    
    let extraPassiveCode = "";
    if (isPassive) extraPassiveCode = `
        // Only proceed if the correct event key was broadcast
        if (!(key === "")) return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const val = _unknownValue as EventValue<typeof key>;
        `;
    
    const descToClean = type == "Hero" ? card.hpText : card.text;
    // card.hpText can be undefined, but shouldn't be if the type is Hero.
    if (descToClean === undefined) throw new Error("Card has no hero power description.");

    // If the text has `<b>Battlecry:</b> Dredge.`, add `// Dredge.` to the battlecry ability
    const cleanedDesc = game.functions.color.stripTags(descToClean).replace(`${ability}: `, "");

    // `create` ability
    const runes = card.runes ? `        self.runes = "${card.runes}"\n` : "";
    let keywords: string = "";

    if (card.keywords) {
        card.keywords.forEach(keyword => {
            // 8 spaces
            keywords += `        self.addKeyword("${keyword}");\n`;
        });
    }

    const createAbility = !card.text ? "" : `

    create(plr, self) {
${runes}${keywords}
    },`;

    delete card.runes;
    delete card.keywords;

    // Normal ability
    // Example 1: '\n\n    passive(plr, self, key, _unknownValue, eventPlayer) {\n        // Your battlecries trigger twice.\n        ...\n    }',
    // Example 2: '\n\n    battlecry(plr, self) {\n        // Deal 2 damage to the opponent.\n        \n    }'
    if (ability) ability = `
    
    ${ability.toLowerCase()}(plr, self${triggerText} {
        // ${cleanedDesc}
        ${extraPassiveCode}
    }`;

    // Create a path to put the card in.
    let path = generateCardPath(card.classes, type).replaceAll("\\", "/");

    // If this function was passed in a path, use that instead.
    if (overridePath) path = game.functions.file.dirname() + overridePath; 

    // Create a filename. Example: "Test Card" -> "test_card.ts"
    let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".ts";

    // If this function was passed in a filename, use that instead.
    if (overrideFilename) filename = overrideFilename;

    // Get the latest card-id
    const id = parseInt(game.functions.file.read("/cards/.latestId")) + 1;
    const fileId = `\n    id: ${id},`;

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
    const passiveImport = isPassive ? ", EventValue" : "";

    // Add the key/value pairs to the content
    const contentArray = Object.entries(card).filter(c => c[0] != "id").map(c => `${c[0]}: ${getTypeValue(c[1])}`);

    // Add the content
    const content = `// Created by the ${creatorType} Card Creator

import { Blueprint${passiveImport} } from "@Game/types.js";

export const blueprint: Blueprint = {
    ${contentArray.join(',\n    ')},${fileId}${createAbility}${ability}
}
`;

    // The path is now "./cardcreator/../cards/...", replace this with "./cards/..."
    const filePath = path + filename;

    if (!debug) {
        // If debug mode is disabled, write the card to disk.
        
        // Increment the id in '.latestId' by 1
        game.functions.file.write("/cards/.latestId", id.toString()); 

        // If the path the card would be written to doesn't exist, create it.
        if (!game.functions.file.exists(path)) game.functions.file.directory.create(path, true);
        // Write the file to the path
        game.functions.file.write(filePath, content);

        game.log('File created at: "' + filePath + '"');

        game.log("Trying to compile...");
        if (game.functions.util.tryCompile()) {
            game.log("<bright:green>Success!</bright:green>");
        } else {
            game.logError("<yellow>WARNING: Compiler error occurred. Please fix the errors in the card.</yellow>");
        }
    } else {
        // If debug mode is enabled, just show some information about the card.
        // This is the id that would be written to '.latestId'
        game.log("\nNew ID: %s", id);
        game.log("Would be path: '%s'", filePath.replaceAll("\\", "/"));
        game.log("Content:");
        game.log(content);
        game.pause();
    }

    generateCardExports();

    // Open the defined editor on that card if it has a function to edit, and debug mode is disabled
    if (ability && !debug) {
        const success = game.functions.util.runCommandAsChildProcess(`${game.config.general.editor} "${filePath}"`);
        if (!success) game.pause();
    }

    return filePath;
}

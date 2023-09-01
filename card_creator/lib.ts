// This is a library

import rl from "readline-sync";
import fs from "fs";
import config from "../config/general.json" assert { "type": "json" };
import { Game, Player } from "../src/internal.js";
import { Blueprint, CardClass, CardType } from "../src/types.js";

const game = new Game();
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
game.setup(player1, player2);
game.functions.importCards(game.functions.dirname() + "cards");
game.functions.importConfig(game.functions.dirname() + "config");

let card: Blueprint;
let type: CardType;

type CCType = "Undefined" | "Class" | "Custom" | "Vanilla";

let debug = false;
let cctype: CCType = "Undefined";

function getCardFunction(card_type: CardType) {
    // Get the card's 'function' (battlecry, cast, deathrattle, etc...)
    let func;

    if (card_type == "Spell") func = "Cast"; // If the card is a spell, the function is 'cast'
    else if (card_type == "Hero") func = "HeroPower"; // If the card is a hero card, the function is 'heropower'
    else if (card_type == "Location") func = "Use"; // If the card is a location, the function is 'use'
    else { // If the card is a Minion or Weapon
        //func = input("Function: ");

        // Try to extract a function from the card's description
        let reg = /[A-Z][a-z].*?:/;
        func = card.desc.match(reg);

        if (card.desc === "") func = ":"; // If the card doesn't have a description, it doesn't get a default function.
        else if (!func) func = "Passive:"; // If it didn't find a function, but the card has text in its' description, the function is 'passive'
        else func = func[0]; // If it found a function, and the card has a description, the function is the function it found in the description.

        func = func.slice(0, -1); // Remove the last ':'
    }

    return func;
}

function generateCardPath(...args: [CardClass[], CardType]) {
    // Create a path to put the card in.
    let [classes, type] = args;

    // DO NOT CHANGE THIS
    let static_path = `../cards/`;

    // You can change this
    let classesString = classes.join("/");
    // If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
    let typeString = (type == "Hero") ? "Heroe" : type;
    let dynamic_path = `Classes/${classesString}/${typeString}s/${card.mana} Cost/`;

    return static_path + dynamic_path;
}

export function create(override_type: CardType, override_card: Blueprint, override_path = "", override_filename = "") {
    card = override_card;
    type = override_type;

    // If the user didn't specify a tribe, but the tribe exists, set the tribe to "None".
    //if (card.tribe && card.tribe === "") card.tribe = "None";

    let file_friendly_type = type.toLowerCase();

    let func = getCardFunction(file_friendly_type as CardType);

    // If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
    if (card.desc.includes("Secret:")) file_friendly_type = "Secret";

    // Here it creates a default function signature
    let isPassive = func.toLowerCase() == "passive";
    let triggerText = ")";
    if (isPassive) triggerText = ", key, _unknownValue)";
    
    let extraPassiveCode = "";
    if (isPassive) extraPassiveCode = `
        // If the key for a different event, stop the function.
        if (key != "") return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const val = _unknownValue as EventValue<typeof key>;
        `;
    
    let desc_to_clean = type == "Hero" ? card.hpDesc : card.desc;
    // card.hpDesc can be undefined, but shouldn't be if the type is Hero.
    if (desc_to_clean === undefined) throw new Error("Card has no hero power description.");

    let cleaned_desc = game.functions.stripTags(desc_to_clean);

    if (func) func = `${func.toLowerCase()}(plr, game, self${triggerText} {
        // ${cleaned_desc}
        ${extraPassiveCode}
    }`; // Examples: '\n\n    passive(plr, game, self, key, val) {\n        // Your battlecries trigger twice\n        }', '\n\n    battlecry(plr, game, self) {\n\n    }'

    // If there are multiple classes in a card, put the card in a directory something like this '.../Class1/Class2/...'
    let classes = card.class.split(" / ") as CardClass[];

    // Create a path to put the card in.
    let path = generateCardPath(classes, file_friendly_type as CardType);
    if (override_path) path = override_path; // If this function was passed in a path, use that instead.

    // Create a filename. Example: "Test Card" -> "test_card.mts"
    let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".mts";
    if (override_filename) filename = override_filename; // If this function was passed in a filename, use that instead.

    // Get the latest card-id
    let id = parseInt(fs.readFileSync("../cards/.latest_id", "utf8"));
    let file_id = `\n    id: ${id},`;

    // Generate the content of the card
    // If the value is a string, put '"value"'. If it is not a string, put 'value'.
    const getTypeValue = (val: any) => {
        let ret = val;

        // If the value is a string, but not an array (arrays are parsed as strings, don't ask), set the value to '"value"'.
        if (typeof(val) === 'string' && val[0] != "[") ret = `"${val}"`; 

        return ret;
    }

    let split_path = path.split(/[\\/]/);
    let num = split_path.length - split_path.indexOf("cards");
    let type_path_rel = "../".repeat(num - 1) + "src/types.js";

    let contentArray = Object.entries(card).map(c => `${c[0]}: ${getTypeValue(c[1])}`); // name: "Test"
    let content = `// Created by the ${cctype} Card Creator

import { Blueprint, EventValue } from "${type_path_rel}";

const blueprint: Blueprint = {
    ${contentArray.join(',\n    ')},${file_id}
    
    ${func}
}

export default blueprint;
`;

    // Reset the type back to default.
    set_type("Undefined");

    // The path is now "./card_creator/../cards/...", replace this with "./cards/..."
    let file_path = path.replaceAll("/", "\\") + filename; // Replace '/' with '\' because windows

    if (!debug) {
        // If debug mode is disabled, write the card to disk.
        
        // Increment the id in '.latest_id' by 1
        fs.writeFileSync("../cards/.latest_id", (id + 1).toString()); 

        // If the path the card would be written to doesn't exist, create it.
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        // Write the file to the path
        fs.writeFileSync(path + filename, content);

        console.log('File created at: "' + file_path + '"');
    } else {
        // If debug mode is enabled, just show some information about the card.
        console.log(`\nNew ID: ${id + 1}`); // This is the id that would be written to '.latest_id'
        console.log(`Would be path: "${file_path.replaceAll("\\", "/").replace(".", "")}"`);
        console.log(`Content: ${content}`);
        rl.question();
    }

    // Open the defined editor on that card if it has a function to edit, and debug mode is disabled
    if (func && !debug) {
        let success = game.functions.openWithArgs(config.editor, `"${file_path}"`);
        if (!success) rl.question();
    }

    return file_path;
}

export function set_debug(state: boolean) {
    debug = state;
}

export function set_type(state: CCType) {
    cctype = state;
}

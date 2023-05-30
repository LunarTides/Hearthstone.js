const rl = require("readline-sync");
const fs = require("fs");
const { Game } = require("../src/game");
const { editor } = require("../config/general.json");

const game = new Game({}, {});
game.dirname = __dirname + "/../";

game.functions.importCards(__dirname + "/../cards");
game.functions.importConfig(__dirname + "/../config");

let card = {};

let shouldExit = false;
let type;

let debug = false;
let cctype = "Custom";

function input(prompt) {
    const ret = rl.question(prompt);

    if (["exit", "stop", "quit", "back"].includes(ret.toLowerCase())) {
        shouldExit = true;

        console.log("Exiting... Please press enter until the program exits.");
    }
    return ret;
}

function applyCard(_card) {
    Object.entries(_card).forEach(c => {
        let [key, val] = c;

        let required_keys = ["name", "desc", "mana", "class", "rarity", "stats", "hpDesc", "hpCost", "cooldown"];
        if (!val && val !== 0 && !required_keys.includes(key)) return;

        card[key] = val;
    });
}

function common() {
    const name = input("Name: ");
    const displayName = input("Display Name: ");
    const description = input("Description: ");
    const cost = input("Mana Cost: ");
    const _class = input("Class: ");
    const rarity = input("Rarity: ");
    let keywords = input("Keywords: ");
    
    let runes;
    if (_class == "Death Knight") runes = input("Runes: ");

    if (keywords) keywords = '["' + keywords.split(', ').join('", "') + '"]';

    return {"name": name, "displayName": displayName, "desc": description, "mana": parseInt(cost), "type": type, "class": _class, "rarity": rarity, "runes": runes, "keywords": keywords};
}

function minion() {
    let _card = common();

    let stats = input("Stats: ");
    const tribe = input("Tribe: ");

    stats = "[" + stats.split("/").join(", ") + "]";

    applyCard({
        "name": _card.name,
        "displayName": _card.displayName,
        "stats": stats,
        "desc": _card.desc,
        "mana": _card.mana,
        "type": _card.type,
        "tribe": tribe,
        "class": _card.class,
        "rarity": _card.rarity,
        "runes": _card.runes,
        "keywords": _card.keywords
    });
}

function spell() {
    let _card = common();

    const spellClass = input("Spell Class: ");

    let combined = Object.assign(_card, { "spellClass": spellClass });

    applyCard(combined);
}

function weapon() {
    let _card = common();

    let stats = input("Stats: ");

    stats = "[" + stats.split("/").join(", ") + "]";

    applyCard({
        "name": _card.name,
        "displayName": _card.displayName,
        "stats": stats,
        "desc": _card.desc,
        "mana": _card.mana,
        "type": _card.type,
        "class": _card.class,
        "rarity": _card.rarity,
        "runes": _card.runes,
        "keywords": _card.keywords
    });
}

function hero() {
    let _card = common();

    const hpDesc = input("Hero Power Description: ");
    let hpCost = input("Hero Power Cost (Default: 2): ");

    if (!hpCost) hpCost = 2;
    hpCost = parseInt(hpCost);

    let combined = Object.assign(_card, {
        "hpDesc": hpDesc,
        "hpCost": hpCost
    });

    applyCard(combined);
}

function location() {
    let _card = common()
    
    let durability = input("Durability (How many times you can trigger this location before it is destroyed): ");
    let cooldown = input("Cooldown (Default: 2): ");

    if (!cooldown) cooldown = 2;
    let stats = `[0, ${durability}]`;

    applyCard({
        "name": _card.name,
        "displayName": _card.displayName,
        "stats": stats,
        "desc": _card.desc,
        "mana": _card.mana,
        "type": _card.type,
        "class": _card.class,
        "rarity": _card.rarity,
        "runes": _card.runes,
        "keywords": _card.keywords,
        "cooldown": cooldown
    });
}

function getCardFunction(card_type) {
    // Get the card's 'function' (battlecry, cast, deathrattle, etc...)
    let func;

    if (card_type == "spell") func = "Cast"; // If the card is a spell, the function is 'cast'
    else if (card_type == "hero") func = "HeroPower"; // If the card is a hero card, the function is 'heropower'
    else if (card_type == "location") func = "Use"; // If the card is a location, the function is 'use'
    else { // If the card is a Minion or Weapon
        //func = input("Function: ");

        // Try to extract a function from the card's description
        let reg = /[A-Z][a-z].*?:/;
        func = card.desc.match(reg);

        if (!func && card.desc) func = "Passive:"; // If it didn't find a function, but the card has text in its' description, the function is 'passive'
        else if (!card.desc) func = ""; // If the card doesn't have a description, it doesn't get a default function.
        else func = func[0]; // If it found a function, and the card has a description, the function is the function it found in the description.

        func = func.slice(0, -1); // Remove the last ':'
    }

    return func;
}

function createCard(override_path = "", override_filename = "") {
    // If the user didn't specify a tribe, but the tribe exists, set the tribe to "None".
    if (card.tribe == "") card.tribe = "None";

    let file_friendly_type = type.toLowerCase();

    let func = getCardFunction(file_friendly_type);

    // Here it creates a default function signature
    let triggerText = ")";
    if (func.toLowerCase() == "passive") triggerText = ", key, val)";

    let cleaned_desc = card.desc.replace(/(?<!~)&\w/g, ""); // Regular expression created by ChatGPT, it removes the "&B"'s but keeps the "~&B"'s since the '~' is the tag's '\'

    if (func) func = `\n\n    ${func.toLowerCase()}(plr, game, self${triggerText} {\n        // ${cleaned_desc}\n        \n    }`; // Examples: '\n\n    passive(plr, game, self, key, val) {\n        // Your battlecries trigger twice\n        }', '\n\n    battlecry(plr, game, self) {\n\n    }'

    // If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
    file_friendly_type = (type == "Hero") ? "Heroe" : type;

    // If there are multiple classes in a card, put the card in a directory something like this '.../Class1/Class2/...'
    let classes = card.class.replaceAll(" / ", "/");

    // If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
    if (card.desc.includes("Secret:")) file_friendly_type = "Secret";

    // Create a path to put the card in.
    let path = `${__dirname}/../cards/Classes/${classes}/${file_friendly_type}s/${card.mana} Cost/`;
    if (override_path) path = override_path; // If this function was passed in a path, use that instead.

    // Create a filename. Example: "Test Card" -> "test_card.js"
    let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".js";
    if (override_filename) filename = override_filename; // If this function was passed in a filename, use that instead.

    // Get the latest card-id
    let id = parseInt(fs.readFileSync(__dirname + "/../cards/.latest_id", "utf8"));
    let file_id = card.uncollectible ? "" : `\n    id: ${id},`; // Don't add an id if the card is uncollectible. Id's are only used when creating/importing a deck.

    // Generate the content of the card
    // If the value is a string, put '"value"'. If it is not a string, put 'value'.
    const getTypeValue = val => {
        let ret = val;

        if (typeof(val) === 'string' && val[0] != "[") ret = `"${val}"`; // If the value is a string, but not an array (arrays are parsed as strings, don't ask), set the value to '"value"'.

        return ret;
    }

    let content = Object.entries(card).map(c => `${c[0]}: ${getTypeValue(c[1])}`); // name: "Test"
    content = `// Created by the ${cctype} Card Creator
module.exports = {
    ${content.join(',\n    ')},${file_id}${func}
}`;

    // The path is now "./card_creator/../cards/...", replace this with "./cards/..."
    path = path.replace("card_creator/../", "");
    let file_path = path.replaceAll("/", "\\") + filename; // Replace '/' with '\' because windows

    if (!debug) {
        // If debug mode is disabled, write the card to disk.
        
        // If the card is not uncollectible, increment the id in '.latest_id' by 1
        if (!card.uncollectible) fs.writeFileSync(__dirname + "/../cards/.latest_id", (id + 1).toString()); 

        // If the path the card would be written to doesn't exist, create it.
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        // Write the file to the path
        fs.writeFileSync(path + filename, content);

        console.log('File created at: "' + file_path + '"');
    } else {
        // If debug mode is enabled, just show some information about the card.
        console.log(`\nNew ID: ${id + 1}`); // This is the id that would be written to '.latest_id'
        console.log(`Would be path: "${file_path}"`);
        console.log(`Content: ${content}`);
    }

    if (!override_path) rl.question(); // If the function was specified a path, assume the function was run from another file so don't pause it.

    // Open the defined editor on that card if it has a function to edit, and debug mode is disabled
    if (func && !debug) {
        let success = game.functions.openWithArgs(editor, `"${file_path}"`);
        if (!success) rl.question();
    }
}

function main(override_type = "", override_path = "", override_filename = "", override_card = null) {
    // Reset the card
    card = {};

    // If this function was given a card, set the card to that card.
    if (override_card) card = override_card;

    // Reset the shouldExit switch
    shouldExit = false;

    // If the function was given a card, assume the function was run from another file, otherwise show a watermark.
    if (!override_card) console.log("Hearthstone.js Card Creator (C) 2022\n");

    // If the function wast passed a type, ask the user for the type of card they want to make
    if (override_type) type = override_type;
    else type = input("Type: ");

    // If a card was already specified, just create the card.
    if (override_card) {
        createCard(override_path, override_filename);
        return;
    }

    if (type.toLowerCase() == "minion") minion();
    else if (type.toLowerCase() == "weapon") weapon();
    else if (type.toLowerCase() == "spell") spell();
    else if (type.toLowerCase() == "location") location();
    else if (type.toLowerCase() == "hero") hero();
    else {
        // Invalid type
        console.log("That is not a valid type!");
        rl.question();

        shouldExit = true;
    }

    // Ask the user if the card should be uncollectible
    let uncollectible = rl.keyInYN("Uncollectible?");
    if (uncollectible) card.uncollectible = uncollectible;

    // Actually create the card
    if (!shouldExit) createCard(override_path, override_filename);
}

function set_debug(state) {
    debug = state;
}

function set_type(state) {
    cctype = state;
}

exports.main = main;
exports.set_debug = set_debug;
exports.set_type = set_type;

// If the program was run directly, run 'main'. This is the same as "if __name__ == '__main__'" in python.
if (require.main == module) main();

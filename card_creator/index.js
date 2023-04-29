const rl = require("readline-sync");
const fs = require("fs");

let card = {};

let shouldExit = false;
let type;

let debug = false;

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

function doCode(_path = "", _filename = "") {
    let uncollectible;

    if (!card.uncollectible && _filename == "") uncollectible = rl.keyInYN("Uncollectible?");
    if (uncollectible) card.uncollectible = uncollectible;

    if (card.tribe == "") card.tribe = "None";

    // Get the cards 'function' (battlecry, cast, deathrattle, etc...)
    let func;
    let _type = type.toLowerCase();

    if (_type == "spell") func = "Cast";
    else if (_type == "hero") func = "HeroPower";
    else if (_type == "location") func = "Use";
    else {
        //func = input("Function: ");
        let reg = /[A-Z][a-z].*?:/;
        func = card.desc.match(reg);
        if (!func && card.desc) func = "Passive:";
        else if (!card.desc) func = "";
        else func = func[0];

        func = func.slice(0, -1);
    }

    let triggerText = ")";
    if (func.toLowerCase() == "passive") triggerText = ", key, val)";
    if (func) func = `\n\n    ${func.toLowerCase()}(plr, game, self${triggerText} {\n\n    }`;

    // If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
    _type = (type == "Hero") ? "Heroe" : type;

    // If there are multiple classes in a card, put the card in a directory something like this '.../Class1/Class2/...'
    let _class = "";
    if (card.class.split(" / ").length > 1) {
        let __class = card.class.split(" / ");

        __class.forEach(c => {
            _class += `${c}/`;
        });

        _class.slice(0, -1);
    }
    if (!_class) _class = card.class;

    // If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
    if (card.desc.includes("Secret:")) _type = "Secret";

    let path = __dirname + `/../cards/Classes/${_class}/${_type}s/${card.mana} Cost/`;
    if (_path) path = _path;

    let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".js";
    if (_filename) filename = _filename;

    let id = parseInt(fs.readFileSync(__dirname + "/../.latest_id", "utf8"));
    _id = card.uncollectible ? "" : `\n    id: ${id},`; // Don't add an id if the card is uncollectible. Id's are only used when creating/importing a deck.

    let content = Object.entries(card).map(c => `${c[0]}: ${(typeof(c[1]) == "string" && c[1][0] != "[") ? '"' + c[1] + '"' : c[1]}`);
    content = `module.exports = {
    ${content.join(',\n    ')},${_id}${func}
}`;

    path = path.replace("card_creator/../", "");
    let __path = path.replaceAll("/", "\\") + filename;

    if (!debug) {
        if (!card.uncollectible) fs.writeFileSync(__dirname + "/../.latest_id", (id + 1).toString());

        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        fs.writeFileSync(path + filename, content);

        console.log('File created at: "' + __path + '"');
    } else {
        console.log(`\nNew ID: ${id + 1}`);
        console.log(`Would be path: "${__path}"`);
        console.log(`Content: ${content}`);
    }

    if (!_path) rl.question();

    if (func && !debug) require("child_process").exec(`start vim "${__path}"`);
}

function main(_type = "", _path = "", _filename = "", _card = null) {
    card = {};
    if (_card) card = _card;

    shouldExit = false;

    if (!_card) console.log("Hearthstone.js Card Creator (C) 2023\n");

    if (_type == "") type = input("Type: ");
    else type = _type;

    if (_card) {
        doCode(_path, _filename);
        return;
    }

    if (type.toLowerCase() == "minion") minion();
    else if (type.toLowerCase() == "weapon") weapon();
    else if (type.toLowerCase() == "spell") spell();
    else if (type.toLowerCase() == "location") location();
    else if (type.toLowerCase() == "hero") hero();
    else {
        console.log("That is not a valid type!");
        rl.question();

        shouldExit = true;
    }

    if (!shouldExit) doCode(_path, _filename);
}

function set_debug(state) {
    debug = state;
}

exports.main = main;
exports.set_debug = set_debug;

if (require.main == module) main();
